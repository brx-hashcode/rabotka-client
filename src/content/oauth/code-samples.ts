/**
 * Complete, copy-pasteable integrations for a partner who already holds a
 * `client_id` and a `client_secret`.
 *
 * Whole files rather than fragments. A partner reading fragments has to guess
 * where the session goes, where the verifier is stored between the two
 * requests, and which checks are optional — and the guesses that get made are
 * always the same three: skipping `state`, keeping the verifier in a cookie,
 * and trusting the ID token without checking `aud`.
 *
 * Both examples decode the ID token WITHOUT verifying its signature, which is
 * correct here and only here: OIDC Core §3.1.3.7 permits validating the issuer
 * by TLS when the token arrives directly from the token endpoint. The comments
 * in the code say so, because a reader who copies this into a place where the
 * token arrives some other way needs to know the rule they are relying on.
 */

const ISSUER = "https://api.rabotka.work";

export const NODE_SAMPLE = `// npm i express express-session
import express from "express";
import session from "express-session";
import crypto from "node:crypto";

const ISSUER        = "${ISSUER}";
const CLIENT_ID     = process.env.RABOTKA_CLIENT_ID;
const CLIENT_SECRET = process.env.RABOTKA_CLIENT_SECRET;
const REDIRECT_URI  = "https://vous.com/callback";   // exactement l'URI enregistrée

const app = express();
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));

const b64u = (buf) => Buffer.from(buf).toString("base64url");

// ── 1. Le bouton « Se connecter avec Rabotka » pointe ici ──────────────────
app.get("/login", (req, res) => {
  const verifier  = crypto.randomBytes(32).toString("base64url");
  const challenge = b64u(crypto.createHash("sha256").update(verifier, "ascii").digest());
  const state     = crypto.randomBytes(16).toString("base64url");
  const nonce     = crypto.randomBytes(16).toString("base64url");

  // Côté serveur, jamais dans le navigateur : c'est ce qui rend inutilisable
  // un code d'autorisation intercepté.
  req.session.oidc = { verifier, state, nonce };

  const url = new URL(\`\${ISSUER}/api/v1/oauth/authorize\`);
  url.search = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid profile phone rabotka:verification",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();

  res.redirect(url.toString());
});

// ── 2. Rabotka renvoie l'utilisateur ici ───────────────────────────────────
app.get("/callback", async (req, res) => {
  const saved = req.session.oidc;
  delete req.session.oidc;               // à usage unique

  if (req.query.error) {
    return res.status(400).send(req.query.error_description ?? req.query.error);
  }

  // CSRF. PKCE ne couvre pas ça : ce sont deux défenses différentes.
  if (!saved || req.query.state !== saved.state) {
    return res.status(400).send("État invalide");
  }

  const response = await fetch(\`\${ISSUER}/api/v1/oauth/token\`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization:
        "Basic " + Buffer.from(\`\${CLIENT_ID}:\${CLIENT_SECRET}\`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: REDIRECT_URI,        // la même qu'à l'étape 1
      code_verifier: saved.verifier,
    }),
  });

  const tokens = await response.json();
  if (!response.ok) {
    return res.status(400).send(tokens.error_description ?? tokens.error);
  }

  // Signature non vérifiée : le jeton arrive directement de /token, sur un
  // canal TLS que nous venons d'authentifier (OIDC Core §3.1.3.7). Si vous le
  // transmettez ailleurs, vérifiez-le contre /.well-known/jwks.json.
  const claims = JSON.parse(
    Buffer.from(tokens.id_token.split(".")[1], "base64url").toString(),
  );

  if (claims.aud !== CLIENT_ID)   return res.status(400).send("aud invalide");
  if (claims.nonce !== saved.nonce) return res.status(400).send("nonce invalide");

  // ── 3. Votre base de données. Tout ce qui précède est du protocole. ──────
  let user = await db.users.findOne({ rabotkaSub: claims.sub });

  if (!user) {                                   // première fois → inscription
    user = await db.users.insert({
      rabotkaSub:   claims.sub,                  // votre clé, pour toujours
      name:         claims.name,
      phone:        claims.phone_number,
      idVerified:   claims.rabotka_verified,     // le verdict KYC de Rabotka
    });
  }

  req.session.userId = user.id;                  // votre session, pas celle de Rabotka
  res.redirect("/");
});

app.listen(3000);`;

export const PHP_SAMPLE = `<?php
// ─────────────────────────────────────────────────────────────────────────
// config.php — inclus par les deux fichiers ci-dessous
// ─────────────────────────────────────────────────────────────────────────
const ISSUER   = '${ISSUER}';
$CLIENT_ID     = getenv('RABOTKA_CLIENT_ID');
$CLIENT_SECRET = getenv('RABOTKA_CLIENT_SECRET');
$REDIRECT_URI  = 'https://vous.com/callback.php';   // exactement l'URI enregistrée

function b64u(string $bytes): string {
    return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
}


<?php
// ─────────────────────────────────────────────────────────────────────────
// login.php — le bouton « Se connecter avec Rabotka » pointe ici
// ─────────────────────────────────────────────────────────────────────────
require __DIR__ . '/config.php';
session_start();

$verifier  = b64u(random_bytes(32));
$challenge = b64u(hash('sha256', $verifier, true));

// Côté serveur, jamais dans le navigateur : c'est ce qui rend inutilisable
// un code d'autorisation intercepté.
$_SESSION['oidc'] = [
    'verifier' => $verifier,
    'state'    => $state = b64u(random_bytes(16)),
    'nonce'    => $nonce = b64u(random_bytes(16)),
];

header('Location: ' . ISSUER . '/api/v1/oauth/authorize?' . http_build_query([
    'client_id'             => $CLIENT_ID,
    'redirect_uri'          => $REDIRECT_URI,
    'response_type'         => 'code',
    'scope'                 => 'openid profile phone rabotka:verification',
    'state'                 => $state,
    'nonce'                 => $nonce,
    'code_challenge'        => $challenge,
    'code_challenge_method' => 'S256',
]));
exit;


<?php
// ─────────────────────────────────────────────────────────────────────────
// callback.php — Rabotka renvoie l'utilisateur ici
// ─────────────────────────────────────────────────────────────────────────
require __DIR__ . '/config.php';   // sinon $CLIENT_ID & co. n'existent pas ici
session_start();

$saved = $_SESSION['oidc'] ?? null;
unset($_SESSION['oidc']);                          // à usage unique

if (isset($_GET['error'])) {
    http_response_code(400);
    exit($_GET['error_description'] ?? $_GET['error']);
}

// CSRF. PKCE ne couvre pas ça : ce sont deux défenses différentes.
if (!$saved || ($_GET['state'] ?? '') !== $saved['state']) {
    http_response_code(400);
    exit('État invalide');
}

$ch = curl_init(ISSUER . '/api/v1/oauth/token');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERPWD        => "$CLIENT_ID:$CLIENT_SECRET",   // client_secret_basic
    CURLOPT_POSTFIELDS     => http_build_query([
        'grant_type'    => 'authorization_code',
        'code'          => $_GET['code'],
        'redirect_uri'  => $REDIRECT_URI,                    // la même qu'à l'étape 1
        'code_verifier' => $saved['verifier'],
    ]),
]);

$body   = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$tokens = json_decode($body, true);
if ($status !== 200) {
    http_response_code(400);
    exit($tokens['error_description'] ?? 'Échec de l\\'échange du code');
}

// Signature non vérifiée : le jeton arrive directement de /token, sur un canal
// TLS que nous venons d'authentifier (OIDC Core §3.1.3.7). Si vous le
// transmettez ailleurs, vérifiez-le contre /.well-known/jwks.json.
[$header, $payload] = explode('.', $tokens['id_token']);
$claims = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);

if ($claims['aud'] !== $CLIENT_ID)        { http_response_code(400); exit('aud invalide'); }
if ($claims['nonce'] !== $saved['nonce']) { http_response_code(400); exit('nonce invalide'); }

// ── Votre base de données. Tout ce qui précède est du protocole. ──────────
$stmt = $pdo->prepare('SELECT * FROM users WHERE rabotka_sub = ?');
$stmt->execute([$claims['sub']]);
$user = $stmt->fetch();

if (!$user) {                                      // première fois → inscription
    $pdo->prepare(
        'INSERT INTO users (rabotka_sub, name, phone, id_verified) VALUES (?, ?, ?, ?)'
    )->execute([
        $claims['sub'],                            // votre clé, pour toujours
        $claims['name'],
        $claims['phone_number'],
        $claims['rabotka_verified'] ? 1 : 0,       // le verdict KYC de Rabotka
    ]);
    $userId = $pdo->lastInsertId();
} else {
    $userId = $user['id'];
}

$_SESSION['user_id'] = $userId;                    // votre session, pas celle de Rabotka
header('Location: /');`;

export const PYTHON_SAMPLE = `# pip install flask requests
import base64, hashlib, json, os, secrets
from urllib.parse import urlencode

import requests
from flask import Flask, redirect, request, session

ISSUER        = "${ISSUER}"
CLIENT_ID     = os.environ["RABOTKA_CLIENT_ID"]
CLIENT_SECRET = os.environ["RABOTKA_CLIENT_SECRET"]
REDIRECT_URI  = "https://vous.com/callback"   # exactement l'URI enregistrée

app = Flask(__name__)
app.secret_key = os.environ["SESSION_SECRET"]


def b64u(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


# ── 1. Le bouton « Se connecter avec Rabotka » pointe ici ──────────────────
@app.get("/login")
def login():
    verifier  = b64u(secrets.token_bytes(32))
    challenge = b64u(hashlib.sha256(verifier.encode("ascii")).digest())

    # Côté serveur, jamais dans le navigateur : c'est ce qui rend inutilisable
    # un code d'autorisation intercepté.
    session["oidc"] = {
        "verifier": verifier,
        "state":    secrets.token_urlsafe(16),
        "nonce":    secrets.token_urlsafe(16),
    }

    return redirect(ISSUER + "/api/v1/oauth/authorize?" + urlencode({
        "client_id":             CLIENT_ID,
        "redirect_uri":          REDIRECT_URI,
        "response_type":         "code",
        "scope":                 "openid profile phone rabotka:verification",
        "state":                 session["oidc"]["state"],
        "nonce":                 session["oidc"]["nonce"],
        "code_challenge":        challenge,
        "code_challenge_method": "S256",
    }))


# ── 2. Rabotka renvoie l'utilisateur ici ───────────────────────────────────
@app.get("/callback")
def callback():
    saved = session.pop("oidc", None)          # à usage unique

    if "error" in request.args:
        return request.args.get("error_description", request.args["error"]), 400

    # CSRF. PKCE ne couvre pas ça : ce sont deux défenses différentes.
    if not saved or request.args.get("state") != saved["state"]:
        return "État invalide", 400

    response = requests.post(
        ISSUER + "/api/v1/oauth/token",
        auth=(CLIENT_ID, CLIENT_SECRET),       # client_secret_basic
        data={
            "grant_type":    "authorization_code",
            "code":          request.args["code"],
            "redirect_uri":  REDIRECT_URI,     # la même qu'à l'étape 1
            "code_verifier": saved["verifier"],
        },
        timeout=10,
    )
    tokens = response.json()
    if not response.ok:
        return tokens.get("error_description", tokens.get("error")), 400

    # Signature non vérifiée : le jeton arrive directement de /token, sur un
    # canal TLS que requests vient d'authentifier (OIDC Core §3.1.3.7). Si vous
    # le transmettez ailleurs, vérifiez-le contre /.well-known/jwks.json.
    payload = tokens["id_token"].split(".")[1]
    payload += "=" * (-len(payload) % 4)       # base64url non paddé
    claims = json.loads(base64.urlsafe_b64decode(payload))

    if claims["aud"] != CLIENT_ID:        return "aud invalide", 400
    if claims["nonce"] != saved["nonce"]: return "nonce invalide", 400

    # ── 3. Votre base de données. Tout ce qui précède est du protocole. ────
    user = db.users.find_one({"rabotka_sub": claims["sub"]})

    if user is None:                           # première fois → inscription
        user = db.users.insert_one({
            "rabotka_sub": claims["sub"],              # votre clé, pour toujours
            "name":        claims.get("name"),
            "phone":       claims.get("phone_number"),
            "id_verified": claims.get("rabotka_verified"),  # le verdict KYC
        })

    session["user_id"] = str(user["_id"])      # votre session, pas celle de Rabotka
    return redirect("/")`;

export const JAVA_SAMPLE = `// Spring Boot 3 — java.net.http, aucune dépendance OIDC
import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class RabotkaLoginController {

  private static final String ISSUER        = "${ISSUER}";
  private static final String CLIENT_ID     = System.getenv("RABOTKA_CLIENT_ID");
  private static final String CLIENT_SECRET = System.getenv("RABOTKA_CLIENT_SECRET");
  private static final String REDIRECT_URI  = "https://vous.com/callback";

  private static final HttpClient HTTP = HttpClient.newHttpClient();
  private static final SecureRandom RANDOM = new SecureRandom();
  private static final ObjectMapper JSON = new ObjectMapper();

  private static String b64u(byte[] raw) {
    return Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
  }

  private static String randomToken() {
    byte[] bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    return b64u(bytes);
  }

  // ── 1. Le bouton « Se connecter avec Rabotka » pointe ici ───────────────
  @GetMapping("/login")
  public void login(HttpSession session, HttpServletResponse res) throws Exception {
    String verifier = randomToken();
    String challenge = b64u(MessageDigest.getInstance("SHA-256")
        .digest(verifier.getBytes(StandardCharsets.US_ASCII)));
    String state = randomToken();
    String nonce = randomToken();

    // Côté serveur, jamais dans le navigateur : c'est ce qui rend inutilisable
    // un code d'autorisation intercepté.
    session.setAttribute("verifier", verifier);
    session.setAttribute("state", state);
    session.setAttribute("nonce", nonce);

    res.sendRedirect(ISSUER + "/api/v1/oauth/authorize"
        + "?client_id=" + enc(CLIENT_ID)
        + "&redirect_uri=" + enc(REDIRECT_URI)
        + "&response_type=code"
        + "&scope=" + enc("openid profile phone rabotka:verification")
        + "&state=" + enc(state)
        + "&nonce=" + enc(nonce)
        + "&code_challenge=" + enc(challenge)
        + "&code_challenge_method=S256");
  }

  // ── 2. Rabotka renvoie l'utilisateur ici ────────────────────────────────
  @GetMapping("/callback")
  public void callback(
      @RequestParam(required = false) String code,
      @RequestParam(required = false) String state,
      @RequestParam(required = false) String error,
      HttpSession session, HttpServletResponse res) throws Exception {

    String savedState    = (String) session.getAttribute("state");
    String savedNonce    = (String) session.getAttribute("nonce");
    String savedVerifier = (String) session.getAttribute("verifier");
    session.removeAttribute("state");            // à usage unique
    session.removeAttribute("nonce");
    session.removeAttribute("verifier");

    if (error != null) { res.sendError(400, error); return; }

    // CSRF. PKCE ne couvre pas ça : ce sont deux défenses différentes.
    if (savedState == null || !savedState.equals(state)) {
      res.sendError(400, "État invalide");
      return;
    }

    String form = "grant_type=authorization_code"
        + "&code=" + enc(code)
        + "&redirect_uri=" + enc(REDIRECT_URI)   // la même qu'à l'étape 1
        + "&code_verifier=" + enc(savedVerifier);

    String basic = Base64.getEncoder()
        .encodeToString((CLIENT_ID + ":" + CLIENT_SECRET).getBytes(StandardCharsets.UTF_8));

    HttpResponse<String> response = HTTP.send(
        HttpRequest.newBuilder(URI.create(ISSUER + "/api/v1/oauth/token"))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .header("Authorization", "Basic " + basic)
            .POST(HttpRequest.BodyPublishers.ofString(form))
            .build(),
        HttpResponse.BodyHandlers.ofString());

    JsonNode tokens = JSON.readTree(response.body());
    if (response.statusCode() != 200) {
      res.sendError(400, tokens.path("error_description").asText("échec"));
      return;
    }

    // Signature non vérifiée : le jeton arrive directement de /token, sur un
    // canal TLS que HttpClient vient d'authentifier (OIDC Core §3.1.3.7). Si
    // vous le transmettez ailleurs, vérifiez-le contre /.well-known/jwks.json.
    String payload = tokens.get("id_token").asText().split("\\\\.")[1];
    JsonNode claims = JSON.readTree(Base64.getUrlDecoder().decode(payload));

    if (!CLIENT_ID.equals(claims.get("aud").asText())) { res.sendError(400, "aud"); return; }
    if (!savedNonce.equals(claims.get("nonce").asText())) { res.sendError(400, "nonce"); return; }

    // ── 3. Votre base de données. Tout ce qui précède est du protocole. ────
    String sub = claims.get("sub").asText();     // votre clé, pour toujours
    User user = users.findByRabotkaSub(sub)
        .orElseGet(() -> users.save(new User(
            sub,
            claims.path("name").asText(null),
            claims.path("phone_number").asText(null),
            claims.path("rabotka_verified").asBoolean(false))));  // le verdict KYC

    session.setAttribute("userId", user.getId()); // votre session, pas celle de Rabotka
    res.sendRedirect("/");
  }

  private static String enc(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }
}`;

export const CODE_SAMPLES = [
  { label: "Node.js", code: NODE_SAMPLE },
  { label: "PHP", code: PHP_SAMPLE },
  { label: "Python", code: PYTHON_SAMPLE },
  { label: "Java", code: JAVA_SAMPLE },
] as const;
