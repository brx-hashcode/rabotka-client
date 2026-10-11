import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryCombobox } from "@/components/common/category-combobox";
import { CountryCityFields } from "@/components/common/country-city-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { DeselectableSelectItem } from "@/components/ui/deselectable-select-item";
import { getCategories } from "@/lib/api/job-category-controller";
import {
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPE_VALUES,
  scheduledAtLabel,
  scheduledAtHelpText,
} from "@/lib/employment-type";
import { minTimeFor, toDateInput } from "@/lib/scheduled-at";
import { useCreateJobOffer } from "@/hooks/use-create-job-offer";
import type { CreatedJobOffer } from "@/lib/api/job-offer-controller";
import { EMPTY_JOB_OFFER_FORM, toCreatePayload } from "@/lib/job-offer-form";
import {
  createJobOfferSchema,
  type jobOfferSchema,
  type CreateJobOfferFormData,
  PAYMENT_FLOW_VALUES,
  PAYMENT_FLOW_LABELS,
} from "@/lib/validations/job-offer";

// The earliest instant the picker may offer. Mirrors the "at least 4h ahead"
// rule in the schema and in the service, so a day or an hour that the server
// would refuse is never presented in the first place.
const MIN_HOURS_AHEAD = 4;
function minScheduledAt(): Date {
  return new Date(Date.now() + MIN_HOURS_AHEAD * 60 * 60 * 1000);
}

type Props = {
  onCreated: (offer: CreatedJobOffer, recap: CreateJobOfferFormData) => void;
};

export function CreateJobOfferForm({ onCreated }: Readonly<Props>) {
  const { mutate: createOffer, isPending } = useCreateJobOffer();

  return (
    <JobOfferForm
      heading="Créer une offre"
      initialValues={EMPTY_JOB_OFFER_FORM}
      schema={createJobOfferSchema}
      submitLabel="Publier l'offre"
      pendingLabel="Publication…"
      // The missions list, NOT back one entry. `navigate(-1)` assumes the user
      // arrived from inside the app; opened from WhatsApp the entry behind this
      // form is the login hop, and going back to it bounces straight here.
      cancelTo="/missions"
      isPending={isPending}
      onSubmit={(data) =>
        createOffer(toCreatePayload(data), {
          onSuccess: (offer) => onCreated(offer, data),
        })
      }
    />
  );
}

type JobOfferFormProps = {
  heading: string;
  initialValues: CreateJobOfferFormData;
  schema: ReturnType<typeof jobOfferSchema>;
  submitLabel: string;
  pendingLabel: string;
  /** Where « Annuler » goes — a fixed page, never back one entry. */
  cancelTo: string;
  /** Replaces `cancelTo` when the caller knows the way back better. */
  onCancel?: () => void;
  isPending: boolean;
  onSubmit: (data: CreateJobOfferFormData) => void;
};

/** The offer form itself, shared by creating and editing an offer. */
export function JobOfferForm({
  heading,
  initialValues,
  schema,
  submitLabel,
  pendingLabel,
  cancelTo,
  onCancel,
  isPending,
  onSubmit,
}: Readonly<JobOfferFormProps>) {
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ["job-categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const form = useForm<CreateJobOfferFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const isRemote = form.watch("isRemote");
  const employmentType = form.watch("employmentType");
  // The time field is disabled and bounded by whichever day is chosen.
  const scheduledDate = form.watch("scheduledDate");

  return (
    // Square and edge to edge, at every width. It fills `AppShell`'s column,
    // which is 512px on a desktop just as on a phone — so rounding it from md
    // up drew a card floating inside a card, and `lg:p-8` doubled the gutter
    // the page was already paying. One 16px padding, once. See the page.
    <div className="bg-white p-4">
      <h2 className="mb-6 text-2xl font-bold">{heading}</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex : Plombier pour réparation urgente"
                    maxLength={100}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez précisément la mission à réaliser."
                    rows={5}
                    maxLength={1000}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hidden, not removed.
              Rabotka is not yet authorised to recruit on anything but a
              one-off mission, so an employer must not be able to pick CDD, CDI
              or stage. The field stays mounted and registered on the form so it
              keeps submitting its default of MISSION — unregistering it would
              send no employment_type at all, and the backend would then apply
              its own MISSION default, which happens to agree today but is a
              coincidence rather than this decision.
              To restore: delete the `hidden` class below. Nothing else. */}
          <FormField
            control={form.control}
            name="employmentType"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Type de contrat *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EMPLOYMENT_TYPE_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {EMPLOYMENT_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Une mission ponctuelle se termine à une date donnée. Un CDI,
                  un CDD ou un stage est un engagement continu.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shown for every type — every offer has a day it stops being open.
              Only the label changes, and that matters: this used to be hidden
              on a CDI/CDD/stage, which left them with no date at all, and every
              scan that retires or closes an offer keys off it. They could never
              expire and never close. */}
          {/* Side by side: they are two halves of one answer, and the hour is
              the narrower question of the two. The shared help line sits under
              the pair rather than inside either column — the date's
              explanation is three lines long, and in half the width it would
              have left the two columns wildly uneven. */}
          <div className="space-y-2">
            {/* `items-end`, not `items-start`. "Date de la mission" and
                "Ouverte jusqu'au" both wrap to two lines in half a column
                while "Heure" stays on one, so aligning the tops left the two
                inputs at different heights. Aligning the bottoms puts the
                fields on one line and lets the labels sit where they fall. */}
            <div className="grid grid-cols-2 items-end gap-3">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  // `min-w-0` because THIS is the grid child, and a grid child
                  // is `min-width: auto` by default — it refuses to shrink
                  // below its content's intrinsic width. A native date input
                  // reports a wide one (iOS renders "24.09.2026 г."), so the
                  // column pushed past its track and the whole page became
                  // pannable sideways. The `min-w-0` already on the Input
                  // could not help: the overflow was one level up.
                  <FormItem className="min-w-0">
                    <FormLabel>{scheduledAtLabel(employmentType)} *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        // The native control blocks the days the server would
                        // refuse, so an invalid one is never offered rather
                        // than rejected after the fact.
                        min={toDateInput(minScheduledAt())}
                        className="w-full min-w-0"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Its own field, and optional. `datetime-local` demanded both
                  halves; an employer often knows the day and settles the time
                  with whoever answers. Native, like the date beside it: on a
                  phone that is the platform's own wheel, already known and
                  already translated. */}
              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Heure</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        // Only on the floor's own day — on any later one every
                        // hour is allowed, and a min there would be present
                        // and meaningless.
                        min={minTimeFor(scheduledDate, minScheduledAt())}
                        className="w-full min-w-0"
                        // Which hours are still legal depends on which day it
                        // is, so there is nothing to answer before the date.
                        disabled={isPending || !scheduledDate}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {scheduledAtHelpText(employmentType)}
            </p>
          </div>

          <FormField
            control={form.control}
            name="isRemote"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 rounded-md bg-muted/40 p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      const isRemote = checked === true;
                      field.onChange(isRemote);
                      // Clear the location rather than hide it: a stale address
                      // left in the form would be submitted the moment someone
                      // unticked and reticked the box.
                      if (isRemote) {
                        form.setValue("address", "");
                        form.setValue("countryCode", "");
                        form.setValue("countryName", "");
                        form.setValue("city", "");
                      }
                    }}
                    disabled={isPending}
                  />
                </FormControl>
                <div className="space-y-0.5 leading-none">
                  <FormLabel className="cursor-pointer">
                    Mission en ligne
                  </FormLabel>
                  <FormDescription>
                    La mission se fait à distance : aucune adresse n'est
                    demandée.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* The whole location block disappears for a remote job — there is no
              site, so a greyed-out address field would just be a question with
              no answer. */}
          {!isRemote && (
            <>
              <CountryCityFields form={form} />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    {/* No asterisk. Optional on purpose — see the schema: a
                        tailor, a mechanic or a hairdresser works at their own
                        place and the client comes to them, so there is often
                        no address to give. The city above carries the
                        geography. */}
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex : 123 Avenue de la Paix, Poto-Poto"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Facultatif. Laissez vide si le client vient sur votre lieu
                      de travail.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de personnes *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant en FCFA (optionnel)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1000}
                    max={1000000}
                    placeholder="Ex : 15000"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentFlow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de rémunération (optionnel)</FormLabel>
                <Select
                  value={field.value ? field.value : undefined}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Optional field: tapping the chosen option clears it,
                        which Radix cannot do on its own. */}
                    {PAYMENT_FLOW_VALUES.map((value) => (
                      <DeselectableSelectItem
                        key={value}
                        value={value}
                        selected={field.value || undefined}
                        onDeselect={() => field.onChange("")}
                      >
                        {PAYMENT_FLOW_LABELS[value]}
                      </DeselectableSelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Always shown, even before the list loads: it is required, and a
              hidden required field would block the form without saying why. */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Domaine</FormLabel>
                <FormControl>
                  <CategoryCombobox
                    options={categories}
                    value={field.value || null}
                    onChange={(id) => field.onChange(id ?? "")}
                    placeholder="Choisir un domaine…"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note complémentaire (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ex : Apporter vos propres outils"
                    rows={3}
                    maxLength={500}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isPending ? pendingLabel : submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => (onCancel ? onCancel() : navigate(cancelTo))}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
