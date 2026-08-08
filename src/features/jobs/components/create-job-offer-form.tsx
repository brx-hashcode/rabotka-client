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
  requiresClosingDate,
} from "@/lib/employment-type";
import { useCreateJobOffer } from "@/hooks/use-create-job-offer";
import type {
  CreateJobOfferPayload,
  CreatedJobOffer,
} from "@/lib/api/job-offer-controller";
import {
  createJobOfferSchema,
  type CreateJobOfferFormData,
  PAYMENT_FLOW_VALUES,
  PAYMENT_FLOW_LABELS,
} from "@/lib/validations/job-offer";

// Earliest selectable value for the datetime-local picker, in local time
// (YYYY-MM-DDTHH:mm). Mirrors the "at least 4h ahead" validation so the native
// picker itself blocks invalid dates.
const MIN_HOURS_AHEAD = 4;
function minScheduledAt(): string {
  const d = new Date(Date.now() + MIN_HOURS_AHEAD * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  onCreated: (offer: CreatedJobOffer, recap: CreateJobOfferFormData) => void;
};

export function CreateJobOfferForm({ onCreated }: Readonly<Props>) {
  const navigate = useNavigate();
  const { mutate: createOffer, isPending } = useCreateJobOffer();

  const { data: categories = [] } = useQuery({
    queryKey: ["job-categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const form = useForm<CreateJobOfferFormData>({
    resolver: zodResolver(createJobOfferSchema),
    defaultValues: {
      title: "",
      description: "",
      employmentType: "MISSION",
      scheduledAt: "",
      isRemote: false,
      countryCode: "",
      countryName: "",
      city: "",
      address: "",
      quantity: 1,
      amount: "",
      paymentFlow: "",
      note: "",
      categoryId: "",
    },
    mode: "onChange",
  });

  const isRemote = form.watch("isRemote");
  const employmentType = form.watch("employmentType");
  // Only a one-off gig closes on a date. Asking a CDI for one would force the
  // employer to invent it, which is what made a permanent role unpostable.
  const needsClosingDate = requiresClosingDate(employmentType);

  const onSubmit = (data: CreateJobOfferFormData) => {
    const payload: CreateJobOfferPayload = {
      title: data.title.trim(),
      description: data.description.trim(),
      employment_type: data.employmentType,
      quantity: data.quantity,
      // A remote job sends no location at all. Sending empty strings would
      // store a country the server then has to reject, and sending the fields
      // for an on-site job is what puts it in the right city.
      ...(data.isRemote
        ? { isRemote: true }
        : {
            isRemote: false,
            address: data.address.trim(),
            countryCode: data.countryCode,
            countryName: data.countryName,
            city: data.city,
          }),
      // Conditional, like every other optional field: an unconditional
      // `new Date("").toISOString()` throws RangeError the moment the field is
      // legitimately left empty.
      ...(data.scheduledAt
        ? { scheduled_at: new Date(data.scheduledAt).toISOString() }
        : {}),
      ...(typeof data.amount === "number" ? { amount: data.amount } : {}),
      ...(data.paymentFlow ? { payment_flow: data.paymentFlow } : {}),
      ...(data.note?.trim() ? { note: data.note.trim() } : {}),
      ...(data.categoryId ? { category_id: data.categoryId } : {}),
    };
    createOffer(payload, {
      onSuccess: (offer) => onCreated(offer, data),
    });
  };

  return (
    <div className="bg-white rounded-lg lg:p-8 p-4">
      <h2 className="text-2xl font-bold mb-6">Créer une offre</h2>

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
                    placeholder="Décrivez précisément le travail à réaliser."
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

          <FormField
            control={form.control}
            name="employmentType"
            render={({ field }) => (
              <FormItem>
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

          {/* Only a one-off gig has a closing date. Hidden rather than
              disabled for the others: a greyed-out field still reads as
              something the employer failed to fill in. */}
          {needsClosingDate && (
            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de clôture *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      min={minScheduledAt()}
                      className="w-full min-w-0 max-w-full"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    La date après laquelle l'offre n'accepte plus de
                    candidatures (au moins 4 heures à l'avance).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                    Le travail se fait à distance : aucune adresse n'est
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
                    <FormLabel>Adresse *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex : 123 Avenue de la Paix, Poto-Poto"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
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

          {categories.length > 0 && (
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Domaine (optionnel)</FormLabel>
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
          )}

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
              {isPending ? "Publication…" : "Publier l'offre"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
