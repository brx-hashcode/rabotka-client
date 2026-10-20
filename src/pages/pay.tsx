import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import type { Value as PhoneValue } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import mtnLogo from "@/assets/MTN-logo.jpg?format=webp";
import airtelLogo from "@/assets/airtel-new-logo.jpg?format=webp";
import rabotkaLogo from "@/assets/rabotka-logo.png?format=webp";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentByToken } from "@/hooks/use-payment-by-token";
import { PaymentReceipt } from "@/features/payments";
import type {
  PaymentGateway,
  PaymentGatewayInfo,
  PaymentOperator,
} from "@/lib/api/payment-controller";
import { usePaymentGateways } from "@/hooks/use-payment-gateways";
import { useProfileInvoices } from "@/hooks/use-profile-invoices";
import { sendInvoiceToWhatsApp } from "@/lib/api/profile-controller";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { OFFLINE_ACTION_HINT, useIsOnline } from "@/hooks/use-is-online";
import { useInitiatePayment } from "@/hooks/use-initiate-payment";
import { useGoBack } from "@/hooks/use-go-back";
import { usePaymentSocket } from "@/hooks/use-payment-socket";
import { getQueryClient } from "@/app/providers";
import {
  ArrowLeft,
  Check,
  Send,
  AlertCircle,
  Loader2,
  XCircle,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  initialPayCountry,
  operatorsIn,
  payCountries,
  regionName,
  type PayCountry,
} from "@/lib/pay-country";

type LocalStatus = "form" | "processing" | "approved" | "rejected" | "timeout";

export default function Pay() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Present only when the pay page was opened from inside the app (not an
  // external WhatsApp link) — lets us offer a "Retour" button back into the app.
  const returnTo = searchParams.get("return");
  const goBack = useGoBack("/home");
  const { data: payment, isLoading, error } = usePaymentByToken(token);
  const { mutate: initiate, isPending } = useInitiatePayment(token ?? "");
  const { data: gateways } = usePaymentGateways();
  const online = useIsOnline();

  const [phone, setPhone] = useState<PhoneValue | null>(null);
  // The payer's pick; until they make one, the first network offered.
  const [operator, setOperator] = useState<string | null>(null);
  // The country whose networks are offered, as pawaPay's own checkout shows
  // it. Null until the payer picks one: then it is their profile's country.
  const [pickedCountry, setPickedCountry] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<LocalStatus>("form");
  const [phoneError, setPhoneError] = useState("");
  const [paidAt, setPaidAt] = useState<Date | null>(null);

  usePaymentSocket(token ?? "", localStatus === "processing", (status) => {
    if (status === "APPROVED") {
      // Approval arrives over the socket, not as a mutation result, so the
      // global MutationCache invalidation in app/providers never fires for it —
      // the only mutation here succeeded when the STK push was *sent*, while
      // the payment was still unpaid. Without this the user returns to a screen
      // still reading "Paiement requis" with a stale wallet balance, and in the
      // WhatsApp webview (no focus/reconnect refetch) it stays that way until a
      // manual reload.
      //
      // Everything EXCEPT this payment: `GET /pay/:token` throws once the
      // request settles, so refetching it here replaced the success screen with
      // "Lien invalide ou expiré" — the invalidation meant to support this
      // screen was destroying it. We already hold the last-good payment, and
      // the token is spent, so there is nothing left to refetch.
      getQueryClient().invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "payment",
      });
      // Stamped here rather than rendered from `new Date()` in the success
      // branch: that re-evaluates on every render, so the receipt's time would
      // drift forward while the screen sat open. The API returns no paidAt, so
      // this is "when approval reached us", which is the honest claim.
      setPaidAt(new Date());
      setLocalStatus("approved");
    } else if (status === "TIMEOUT") setLocalStatus("timeout");
    else setLocalStatus("rejected");
  });

  // The live gateway, and the networks it can charge in the payer's country.
  const gateway = activeGateway(gateways?.gateways, gateways?.active ?? payment?.gateway);
  const needsOperator = gateway?.requiresOperator ?? false;
  // Every country, name, flag and currency here comes from the gateway's live
  // configuration — none is listed in code.
  const covered = useMemo(() => payCountries(gateway), [gateway]);
  const country =
    pickedCountry ??
    initialPayCountry(payment?.payerCountryCode, covered)?.code ??
    null;
  const current: PayCountry | null =
    covered.find((c) => c.code === country) ?? null;
  const operators = useMemo(
    () => operatorsIn(gateway, country),
    [gateway, country],
  );
  // From the selector: the number typed was for the old country.
  const chooseCountry = (next: string) => {
    if (next === country) return;
    setPickedCountry(next);
    setPhone(null);
    setPhoneError("");
  };
  const selectedOperator =
    operators.find((o) => o.code === operator) ?? operators[0] ?? null;

  // The invoice for this payment, once it is approved. Issued while the
  // payment is processed, so it is normally there by the time the approval
  // arrives; polled briefly in case it lands a moment later. Only a logged-in
  // payer can list (and download) their invoices: without a session the list
  // fails and the page says where to find it instead.
  const approved = localStatus === "approved";
  const invoices = useProfileInvoices({ enabled: approved });
  const invoice =
    invoices.data?.find((i) => i.paymentRequestId === payment?.id) ?? null;
  const [invoiceChecks, setInvoiceChecks] = useState(0);
  const waitingForInvoice =
    approved && !invoice && !invoices.isError && invoiceChecks < 6;
  const { refetch: refetchInvoices, isFetching: fetchingInvoices } = invoices;
  useEffect(() => {
    if (!waitingForInvoice || fetchingInvoices) return;
    const timer = setTimeout(() => {
      setInvoiceChecks((n) => n + 1);
      void refetchInvoices();
    }, 2000);
    return () => clearTimeout(timer);
  }, [waitingForInvoice, fetchingInvoices, refetchInvoices]);
  // "Envoyer le reçu": the invoice PDF to the payer's own WhatsApp, only when
  // they ask for it.
  const { toast } = useToast();
  const sendReceipt = useMutation({
    mutationFn: (invoiceId: string) => sendInvoiceToWhatsApp(invoiceId),
    onSuccess: () =>
      toast({ description: "Votre reçu a été envoyé sur WhatsApp." }),
    onError: (error) =>
      toast({
        variant: "destructive",
        description: receiptErrorMessage(error),
      }),
  });

  const handlePay = () => {
    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError("Veuillez entrer un numéro de téléphone valide.");
      return;
    }
    if (needsOperator && !selectedOperator) {
      setPhoneError("Veuillez sélectionner un opérateur.");
      return;
    }
    setPhoneError("");
    // The full international number: the gateway needs the country code, and
    // stripping +242 broke every number from another country.
    initiate(
      {
        phone,
        ...(needsOperator && selectedOperator
          ? { operator: selectedOperator.code }
          : {}),
      },
      {
        onSuccess: () => setLocalStatus("processing"),
        onError: () => setLocalStatus("rejected"),
      },
    );
  };

  // Before the loading and error branches, deliberately. The socket is the
  // authority on this: once it says APPROVED, the money has moved and the token
  // is spent — so `GET /pay/:token` failing from here on is the expected
  // outcome, not a reason to tell someone who just paid that their link is
  // invalid. Nothing below may override it.
  if (localStatus === "approved") {
    const backLabel = returnTo ? "Retour à l'application" : "Aller à l'accueil";
    return (
      // Top-aligned like the form it replaces: centred, the confirmation
      // floated in the middle of a tall screen with a void above it.
      <PageWrapper align="top">
        <div className="w-full space-y-6 pt-4 animate-in fade-in duration-500">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 animate-in zoom-in-50 duration-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
                <Check className="h-8 w-8 text-white" strokeWidth={3} />
              </div>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              Paiement effectué
            </h1>
            {/* The amount belongs in the confirmation line, not only in the
                receipt below: it is the one fact someone checks before they
                stop reading. Optional chaining because this branch runs even
                when the payment query is in an error state — the socket is
                the authority, and the confirmation does not depend on `data`. */}
            <p className="mt-1 text-sm text-muted-foreground">
              {typeof payment?.amount === "number"
                ? `Vous avez payé ${payment.amount.toLocaleString("fr-FR")} FCFA.`
                : "Votre paiement a bien été confirmé."}
            </p>
          </div>

          {payment && (
            <PaymentReceipt
              rows={[
                {
                  label: "Référence",
                  value: payment.id.slice(0, 8).toUpperCase(),
                },
                ...(paidAt
                  ? [
                      {
                        label: "Date",
                        value: paidAt.toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      },
                    ]
                  : []),
                {
                  label: "Moyen",
                  value: methodLabel(payment.gateway, selectedOperator),
                },
                ...(typeof payment.amount === "number"
                  ? [
                      {
                        label: "Montant",
                        value: `${payment.amount.toLocaleString("fr-FR")} FCFA`,
                        emphasis: true,
                      },
                    ]
                  : []),
                ...(payment.description
                  ? [{ label: "Objet", value: payment.description }]
                  : []),
                { label: "Statut", value: "Confirmé", tone: "success" as const },
              ]}
            />
          )}

          {/*
            Always offer a way onward. A payment opened from a WhatsApp link
            carries no `return`, and this screen has no header and no tab bar.
          */}
          <div className="space-y-2.5">
            {invoice ? (
              <Button
                className="h-12 w-full bg-whatsapp text-base font-semibold text-white hover:bg-whatsapp-dark"
                onClick={() => sendReceipt.mutate(invoice.id)}
                disabled={sendReceipt.isPending || sendReceipt.isSuccess}
              >
                {sendReceipt.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : sendReceipt.isSuccess ? (
                  <Check className="mr-2 h-5 w-5" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                {sendReceipt.isPending
                  ? "Envoi en cours…"
                  : sendReceipt.isSuccess
                    ? "Reçu envoyé sur WhatsApp"
                    : "Envoyer le reçu"}
              </Button>
            ) : waitingForInvoice ? (
              <Button className="h-12 w-full text-base" variant="secondary" disabled>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Préparation du reçu…
              </Button>
            ) : null}

            <Button
              variant={invoice || waitingForInvoice ? "secondary" : "default"}
              className={cn(
                "h-12 w-full text-base font-semibold",
                !invoice &&
                  !waitingForInvoice &&
                  "bg-whatsapp text-white hover:bg-whatsapp-dark",
              )}
              onClick={() => navigate(returnTo ?? "/home")}
            >
              {backLabel}
            </Button>

            {!invoice && !waitingForInvoice && (
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Votre reçu est disponible dans votre profil, rubrique Factures.
              </p>
            )}
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-10 rounded-md" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !payment) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold">Lien invalide ou expiré</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Ce lien de paiement est introuvable ou a déjà été traité. Si vous
            venez de payer, votre paiement a bien été pris en compte.
          </p>
          {/*
            A token is consumed once its payment settles, so this is what a
            *successful* payer sees on reloading or reopening the link — the
            reassurance above plus a way onward, instead of a bare error.
          */}
          <Button
            className="mt-2 bg-whatsapp text-white hover:bg-whatsapp-dark"
            onClick={() => navigate(returnTo ?? "/home")}
          >
            {returnTo ? "Retour à l'application" : "Aller à l'accueil"}
          </Button>
        </div>
      </PageWrapper>
    );
  }

  if (localStatus === "rejected") {
    return (
      <PageWrapper>
        <div className="text-center space-y-4">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Paiement échoué</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Le paiement n'a pas pu être traité. Veuillez réessayer.
          </p>
          <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
            <Button onClick={() => setLocalStatus("form")} variant="outline">
              Réessayer
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => navigate(returnTo ?? "/home")}
            >
              {returnTo ? "Retour à l'application" : "Aller à l'accueil"}
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (localStatus === "timeout") {
    return (
      <PageWrapper>
        <div className="text-center space-y-4">
          <Loader className="h-14 w-14 text-yellow-500 mx-auto animate-spin" />
          <h1 className="text-xl font-bold">Paiement en cours de traitement</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            La confirmation prend plus de temps que prévu. Ne fermez pas cette
            page — votre paiement sera confirmé dès réception de la confirmation
            de l'opérateur.
          </p>
          {/* Waiting is the advice, not a requirement: the webhook settles the
              payment server-side whether or not this page stays open. */}
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => navigate(returnTo ?? "/home")}
          >
            {returnTo ? "Retour à l'application" : "Aller à l'accueil"}
          </Button>
        </div>
      </PageWrapper>
    );
  }

  if (localStatus === "processing") {
    return (
      <PageWrapper>
        <div className="text-center space-y-4">
          <Loader className="h-14 w-14 text-primary mx-auto animate-spin" />
          <h1 className="text-xl font-bold">En attente de confirmation</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Une demande de paiement a été envoyée sur votre téléphone. Veuillez
            confirmer sur votre téléphone.
          </p>
        </div>
      </PageWrapper>
    );
  }

  const amount = payment.amount;
  const description = payment.description;
  const isMtnMomo = !needsOperator && payment.gateway === "MTN_MOMO";
  const phoneCountry = current?.alpha2;
  const coveredAlpha2 = covered.flatMap((c) => (c.alpha2 ? [c.alpha2] : []));
  // The profile's country is not one we can charge in (its mobile money is in
  // another currency than the franc CFA): say which, and that a number from a
  // listed country works. Its name from the browser, not a table.
  const payerCountryCode = payment.payerCountryCode ?? null;
  const payerCovered = covered.some(
    (c) => c.alpha2 && c.alpha2 === payerCountryCode?.toUpperCase(),
  );
  const payerCountryName = payerCountryCode ? regionName(payerCountryCode) : null;
  const payerNotCovered =
    needsOperator && covered.length > 0 && !!payerCountryCode && !payerCovered;

  return (
    <PageWrapper align="top">
      <div className="w-full space-y-5">
        {/* The way out. Opened from the app, it returns to the screen that
            sent the user here; from a WhatsApp link there may be no history
            at all, and useGoBack falls back to /home instead of doing
            nothing. Same button as the in-app payment chooser. */}
        {/* At the far end of the logo row, so the logo keeps its place on
            the column's edge. Labelled, since on its own an arrow beside a
            logo reads as decoration. */}
        <div className="flex items-center justify-between gap-3">
          <img src={rabotkaLogo} alt="Rabotka" className="h-10 w-auto" />
          <button
            type="button"
            onClick={() => (returnTo ? navigate(returnTo) : goBack())}
            disabled={isPending}
            className="-mr-2 flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-foreground">Paiement</h1>
          <p className="text-sm text-muted-foreground">
            Pour{" "}
            <span className="font-semibold text-foreground">
              {payment.profileName}
            </span>
          </p>
        </div>

        {/* The one number on the screen that matters, so it gets a label and
            the largest type rather than sitting unannounced under a long
            description. The purpose moves below it: useful for confirming you
            are on the right payment, but not the thing you read first. */}
        <div className="rounded-xl bg-card px-5 py-4 shadow-soft">
          <p className="text-xs font-medium text-muted-foreground">
            Montant à payer
          </p>
          <p className="mt-1 text-4xl font-bold leading-none text-foreground">
            {/* `!== null` was not enough: a response missing `amount`
                entirely slipped through as undefined and took the whole
                payment page down with it. */}
            {typeof amount === "number" ? amount.toLocaleString("fr-FR") : "—"}
            {/* The selected country's franc: XAF in Congo, XOF in Bénin —
                the same amount, the two francs being at par. */}
            <span className="ml-1.5 text-base font-medium text-muted-foreground">
              {current?.currency ?? "FCFA"}
            </span>
          </p>
          {description && (
            <p className="mt-2.5 text-xs leading-snug text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {needsOperator && covered.length > 0 && (
          <div className="space-y-2">
            <label
              htmlFor="pay-country"
              className="text-sm font-medium text-foreground"
            >
              Pays
            </label>
            <Select value={country ?? undefined} onValueChange={chooseCountry}>
              <SelectTrigger id="pay-country" className="h-12 w-full">
                <SelectValue placeholder="Choisir un pays" />
              </SelectTrigger>
              <SelectContent>
                {covered.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2.5">
                      <CountryFlag country={c} />
                      <span>{c.name}</span>
                      {c.currency && (
                        <span className="text-xs text-muted-foreground">
                          {c.currency}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {payerNotCovered && (
              <p className="text-xs text-muted-foreground">
                Les paiements Rabotka se font en franc CFA : le mobile money
                {payerCountryName ? ` de « ${payerCountryName} »` : " de votre pays"}{" "}
                n'est pas encore accepté. Payez avec un numéro d'un des pays
                ci-dessus.
              </p>
            )}
          </div>
        )}

        {needsOperator && (
          <div className="space-y-2">
            <label
              htmlFor="operator"
              className="text-sm font-medium text-foreground"
            >
              Opérateur mobile
            </label>
            {operators.length > 0 ? (
              // A real radiogroup: these are one exclusive choice, and without
              // the role a screen reader announced unrelated buttons.
              <div
                role="radiogroup"
                aria-label="Opérateur mobile"
                className="grid grid-cols-2 gap-2.5"
              >
                {operators.map((o) => (
                  <OperatorCard
                    key={o.code}
                    label={o.label}
                    selected={selectedOperator?.code === o.code}
                    logo={o.logo ?? operatorLogo(o.code)}
                    onClick={() => setOperator(o.code)}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-soft">
                Le paiement mobile n'est pas encore disponible dans votre pays.
              </p>
            )}
          </div>
        )}

        {isMtnMomo && (
          // Not a warning. This states which operator will be charged when
          // there is no choice to make, so it gets the same card treatment as
          // the tiles above rather than a bordered yellow alert box.
          <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-soft">
            <img
              src={mtnLogo}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                MTN Mobile Money
              </p>
              <p className="text-xs text-muted-foreground">
                Confirmation sur votre téléphone
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="phone-input"
            className="text-sm font-medium text-foreground"
          >
            {isMtnMomo
              ? "Numéro MTN Mobile Money"
              : selectedOperator
                ? `Numéro ${selectedOperator.label}`
                : "Numéro de téléphone"}
          </label>
          <PhoneInput
            // The flag is the country chosen above, and choosing another flag
            // here chooses that country — its networks replace the list. Keyed
            // on it so the field re-opens on the new flag, which a changed
            // `defaultCountry` alone does not do once a number is typed.
            key={phoneCountry}
            defaultCountry={phoneCountry}
            countries={coveredAlpha2.length ? coveredAlpha2 : undefined}
            onCountryChange={(next) => {
              const picked = covered.find((c) => c.alpha2 === next);
              if (picked && picked.code !== country) setPickedCountry(picked.code);
            }}
            value={phone}
            onChange={(value) => {
              setPhone(value);
              if (phoneError) setPhoneError("");
            }}
            placeholder={current?.dialCode ? `+${current.dialCode}` : ""}
          />
          {phoneError && (
            <p className="text-xs text-destructive">{phoneError}</p>
          )}
        </div>

        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handlePay}
          disabled={isPending || !online || (needsOperator && operators.length === 0)}
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          {isPending ? "Envoi en cours..." : online ? "Payer" : OFFLINE_ACTION_HINT}
        </Button>
      </div>

      {/* At the foot of the screen, not under the button: it is a reassurance
          about the whole page, and right under « Payer » it read as part of
          the form. `mt-auto` in the page's column; on a short screen it
          simply follows the form. */}
      <p className="mt-auto flex items-center justify-center gap-1 pt-10 text-center text-xs text-muted-foreground">
        <span>🔒</span>
        <span>
          Paiement sécurisé avec{" "}
          <span className="font-semibold text-foreground">CashLock</span>
        </span>
      </p>
    </PageWrapper>
  );
}

function PageWrapper({
  children,
  align = "center",
}: Readonly<{ children: React.ReactNode; align?: "center" | "top" }>) {
  return (
    // The form is top-anchored: it opens with a logo and a heading, and on a
    // tall phone geometric centring pushed those into the middle of the screen
    // with a void above them. The terminal states stay centred, where a single
    // message is the whole screen.
    <div
      className={cn(
        "flex min-h-dvh flex-col overflow-hidden bg-background px-6",
        align === "top"
          ? "items-center justify-start pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8"
          : "items-center justify-center py-12",
      )}
    >
      {children}
    </div>
  );
}

function OperatorCard({
  label,
  selected,
  logo,
  onClick,
}: Readonly<{
  label: string;
  selected: boolean;
  /** Absent for a network we have no logo for: its initials stand in. */
  logo?: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        // Matches the method tiles in PaymentMethodChooser: elevated card, a
        // single-pixel accent border when active, and a check badge. Was
        // `border-2` plus a `ring-2` halo with no shadow, which made the two
        // operator cards the only outlined boxes in the payment flow — and the
        // unselected `border-border` read as a washed-out disabled state.
        "flex flex-col gap-2 rounded-xl border p-3.5 text-left transition-colors",
        selected
          ? "border-whatsapp bg-whatsapp-light shadow-soft"
          : "border-transparent bg-card shadow-soft",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {logo ? (
          <img
            src={logo}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground"
          >
            {initials(label)}
          </span>
        )}
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
            selected ? "bg-whatsapp text-primary-foreground" : "bg-muted",
          )}
        >
          {selected && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
      </div>
      <p className="text-sm font-semibold leading-tight text-foreground">
        {label}
      </p>
    </button>
  );
}


/**
 * What to tell the payer when the receipt could not be sent. The send limit
 * comes back as the throttler's English message, which is not for them.
 */
function receiptErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/too many requests|throttler/i.test(message)) {
    return "Vous avez demandé ce reçu plusieurs fois. Réessayez dans quelques minutes.";
  }
  return message || "L'envoi du reçu a échoué. Réessayez.";
}

/** The gateway in use: the live one, as the backend names it. */
function activeGateway(
  gateways: PaymentGatewayInfo[] | undefined,
  key: PaymentGateway | null | undefined,
): PaymentGatewayInfo | null {
  if (!gateways || !key) return null;
  return gateways.find((g) => g.key === key) ?? null;
}

/** The gateway's flag image for a country. */
function CountryFlag({ country }: Readonly<{ country: PayCountry }>) {
  if (country.flag) {
    return (
      <img
        src={country.flag}
        alt=""
        className="h-4 w-6 shrink-0 rounded-sm object-cover"
      />
    );
  }
  // No image from the gateway (its fallback list): the phone field's own.
  const Flag = country.alpha2 ? flags[country.alpha2] : undefined;
  return (
    <span className="inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:size-full">
      {Flag && <Flag title={country.name} />}
    </span>
  );
}

/** The logo we have for a network, matched on its code's network part. */
function operatorLogo(code: string): string | undefined {
  if (code.startsWith("MTN")) return mtnLogo;
  if (code.startsWith("AIRTEL")) return airtelLogo;
  return undefined;
}

function initials(label: string): string {
  return label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * What the payer actually used, in their words: the network they picked, or
 * for a single-network gateway (MTN MoMo) the gateway itself.
 */
function methodLabel(
  gateway: PaymentGateway | null,
  operator: PaymentOperator | null,
): string {
  if (operator) return operator.label;
  if (gateway === "MTN_MOMO") return "MTN Mobile Money";
  return "Mobile Money";
}
