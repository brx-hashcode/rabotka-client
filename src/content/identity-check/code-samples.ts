/**
 * Complete integrations of the identity-check API: create a check, then
 * receive and verify the signed webhook.
 *
 * Unlike the login samples, these DO verify the JWS signature. A webhook
 * reaches a public URL that anyone can POST to, so the signature is the only
 * thing proving Rabotka sent it — the TLS exception that lets the login samples
 * skip it does not apply here.
 */

const API = "https://api.rabotka.work";

export const IC_NODE_SAMPLE = `// npm i express jose
import express from "express";
import crypto from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

const API           = "${API}";
const CLIENT_ID     = process.env.RABOTKA_CLIENT_ID;
const CLIENT_SECRET = process.env.RABOTKA_CLIENT_SECRET;
const AUTH = "Basic " + Buffer.from(\`\${CLIENT_ID}:\${CLIENT_SECRET}\`).toString("base64");

// Clés publiques de Rabotka, mises en cache par jose.
const JWKS = createRemoteJWKSet(new URL(\`\${API}/.well-known/jwks.json\`));

const app = express();
app.use(express.json());

// ── 1. Demander une vérification ───────────────────────────────────────────
app.post("/kyc/start", async (req, res) => {
  const response = await fetch(\`\${API}/api/v1/identity-checks\`, {
    method: "POST",
    headers: {
      authorization: AUTH,
      "content-type": "application/json",
      // Un nouvel essai avec la même clé renvoie la même vérification.
      "idempotency-key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      phone: req.body.phone,            // avec l'indicatif : +242…
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      country_code: "CG",               // facultatif
      reference: req.body.applicationId // votre propre identifiant
    }),
  });

  const check = await response.json();
  if (!response.ok) return res.status(400).send(check.error_description);

  await db.kycChecks.insert({ rabotkaId: check.id, status: check.status });
  res.json({ status: "en_attente" });   // la personne répond sur WhatsApp
});

// ── 2. Recevoir le résultat ────────────────────────────────────────────────
app.post("/webhooks/rabotka", async (req, res) => {
  let payload;
  try {
    ({ payload } = await jwtVerify(req.body.jws, JWKS, {
      issuer: "${API}",
      audience: CLIENT_ID,              // refuse ce qui était destiné à un autre
      typ: "rabotka-identity-check+jwt",
    }));
  } catch {
    return res.sendStatus(400);         // pas signé par Rabotka : on ignore
  }

  const check = payload.check;
  await db.kycChecks.update(
    { rabotkaId: check.id },
    {
      status: check.status,             // "completed" ou "not_completed"
      score: check.score ?? null,
      recommendation: check.recommendation ?? null,
      kycStatus: check.kyc?.status ?? null,
    },
  );

  res.sendStatus(204);                  // tout 2xx en moins de 10 s
});

app.listen(3000);`;

export const IC_PHP_SAMPLE = `<?php
// composer require firebase/php-jwt
use Firebase\\JWT\\JWT;
use Firebase\\JWT\\JWK;

const API = '${API}';
$CLIENT_ID     = getenv('RABOTKA_CLIENT_ID');
$CLIENT_SECRET = getenv('RABOTKA_CLIENT_SECRET');

// ─────────────────────────────────────────────────────────────────────────
// start.php — demander une vérification
// ─────────────────────────────────────────────────────────────────────────
$ch = curl_init(API . '/api/v1/identity-checks');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERPWD        => "$CLIENT_ID:$CLIENT_SECRET",
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Idempotency-Key: ' . bin2hex(random_bytes(16)),
    ],
    CURLOPT_POSTFIELDS     => json_encode([
        'phone'        => $_POST['phone'],        // avec l'indicatif : +242…
        'first_name'   => $_POST['first_name'],
        'last_name'    => $_POST['last_name'],
        'country_code' => 'CG',                   // facultatif
        'reference'    => $_POST['application_id'],
    ]),
]);
$check = json_decode(curl_exec($ch), true);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($status !== 202) {
    http_response_code(400);
    exit($check['error_description'] ?? 'Erreur');
}
$db->insertKycCheck($check['id'], $check['status']);

// ─────────────────────────────────────────────────────────────────────────
// webhook.php — recevoir le résultat
// ─────────────────────────────────────────────────────────────────────────
$body = json_decode(file_get_contents('php://input'), true);

try {
    // Mettez ce jeu de clés en cache (une heure suffit).
    $jwks = json_decode(file_get_contents(API . '/.well-known/jwks.json'), true);
    $claims = JWT::decode($body['jws'] ?? '', JWK::parseKeySet($jwks, 'RS256'));
} catch (Throwable $e) {
    http_response_code(400);              // pas signé par Rabotka
    exit;
}

if ($claims->iss !== API || $claims->aud !== $CLIENT_ID) {
    http_response_code(400);              // destiné à quelqu'un d'autre
    exit;
}

$check = $claims->check;
$db->updateKycCheck($check->id, [
    'status'         => $check->status,   // "completed" ou "not_completed"
    'score'          => $check->score ?? null,
    'recommendation' => $check->recommendation ?? null,
    'kyc_status'     => $check->kyc->status ?? null,
]);

http_response_code(204);                  // tout 2xx en moins de 10 s`;

export const IC_PYTHON_SAMPLE = `# pip install flask requests pyjwt[crypto]
import os, uuid
import jwt, requests
from flask import Flask, request, abort

API           = "${API}"
CLIENT_ID     = os.environ["RABOTKA_CLIENT_ID"]
CLIENT_SECRET = os.environ["RABOTKA_CLIENT_SECRET"]

# Clés publiques de Rabotka, mises en cache par PyJWKClient.
jwks = jwt.PyJWKClient(f"{API}/.well-known/jwks.json")
app = Flask(__name__)

# ── 1. Demander une vérification ───────────────────────────────────────────
@app.post("/kyc/start")
def start():
    r = requests.post(
        f"{API}/api/v1/identity-checks",
        auth=(CLIENT_ID, CLIENT_SECRET),
        headers={"Idempotency-Key": str(uuid.uuid4())},
        json={
            "phone": request.json["phone"],          # avec l'indicatif : +242…
            "first_name": request.json["first_name"],
            "last_name": request.json["last_name"],
            "country_code": "CG",                    # facultatif
            "reference": request.json["application_id"],
        },
        timeout=10,
    )
    check = r.json()
    if r.status_code != 202:
        abort(400, check.get("error_description"))

    db.kyc_checks.insert(rabotka_id=check["id"], status=check["status"])
    return {"status": "en_attente"}                  # la personne répond sur WhatsApp

# ── 2. Recevoir le résultat ────────────────────────────────────────────────
@app.post("/webhooks/rabotka")
def webhook():
    token = (request.get_json(silent=True) or {}).get("jws", "")
    try:
        key = jwks.get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token, key, algorithms=["RS256"],
            issuer=API, audience=CLIENT_ID,          # refuse ce qui était destiné à un autre
        )
    except jwt.PyJWTError:
        abort(400)                                   # pas signé par Rabotka

    check = claims["check"]
    db.kyc_checks.update(
        rabotka_id=check["id"],
        status=check["status"],                      # "completed" ou "not_completed"
        score=check.get("score"),
        recommendation=check.get("recommendation"),
        kyc_status=(check.get("kyc") or {}).get("status"),
    )
    return "", 204                                   # tout 2xx en moins de 10 s`;

export const IC_JAVA_SAMPLE = `// Spring Boot 3 + com.nimbusds:nimbus-jose-jwt
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSourceBuilder;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import java.net.URL;
import java.util.*;

@RestController
public class RabotkaIdentityCheck {
  static final String API = "${API}";
  final String clientId     = System.getenv("RABOTKA_CLIENT_ID");
  final String clientSecret = System.getenv("RABOTKA_CLIENT_SECRET");
  final RestClient http = RestClient.create();
  final DefaultJWTProcessor<?> jwt = new DefaultJWTProcessor<>();

  public RabotkaIdentityCheck() throws Exception {
    // Clés publiques de Rabotka, mises en cache par Nimbus.
    var keys = JWKSourceBuilder.create(new URL(API + "/.well-known/jwks.json")).build();
    jwt.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keys));
    jwt.setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>(
        clientId,                                        // aud : refuse ce qui était destiné à un autre
        new JWTClaimsSet.Builder().issuer(API).build(),
        Set.of("sub", "exp")));
  }

  // ── 1. Demander une vérification ─────────────────────────────────────────
  @PostMapping("/kyc/start")
  Map<String, Object> start(@RequestBody Map<String, String> in) {
    Map<?, ?> check = http.post()
        .uri(API + "/api/v1/identity-checks")
        .headers(h -> {
          h.setBasicAuth(clientId, clientSecret);
          h.set("Idempotency-Key", UUID.randomUUID().toString());
        })
        .contentType(MediaType.APPLICATION_JSON)
        .body(Map.of(
            "phone", in.get("phone"),                    // avec l'indicatif : +242…
            "first_name", in.get("firstName"),
            "last_name", in.get("lastName"),
            "country_code", "CG",                        // facultatif
            "reference", in.get("applicationId")))
        .retrieve()
        .body(Map.class);

    db.insertKycCheck((String) check.get("id"), (String) check.get("status"));
    return Map.of("status", "en_attente");               // la personne répond sur WhatsApp
  }

  // ── 2. Recevoir le résultat ──────────────────────────────────────────────
  @PostMapping("/webhooks/rabotka")
  ResponseEntity<Void> webhook(@RequestBody Map<String, String> body) {
    JWTClaimsSet claims;
    try {
      claims = jwt.process(body.get("jws"), null);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();        // pas signé par Rabotka
    }

    Map<String, Object> check = (Map<String, Object>) claims.getClaim("check");
    Map<String, Object> kyc = (Map<String, Object>) check.get("kyc");
    db.updateKycCheck(
        (String) check.get("id"),
        (String) check.get("status"),                    // "completed" ou "not_completed"
        check.get("score"),
        check.get("recommendation"),
        kyc == null ? null : kyc.get("status"));

    return ResponseEntity.noContent().build();           // tout 2xx en moins de 10 s
  }
}`;

export const IDENTITY_CHECK_CODE_SAMPLES = [
  { label: "Node.js", code: IC_NODE_SAMPLE },
  { label: "PHP", code: IC_PHP_SAMPLE },
  { label: "Python", code: IC_PYTHON_SAMPLE },
  { label: "Java", code: IC_JAVA_SAMPLE },
] as const;
