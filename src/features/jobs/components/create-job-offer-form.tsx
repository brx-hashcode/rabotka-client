import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getCategories } from "@/lib/api/job-category-controller";
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

type Props = {
  onCreated: (offer: CreatedJobOffer, recap: CreateJobOfferFormData) => void;
};

export function CreateJobOfferForm({ onCreated }: Readonly<Props>) {
  const navigate = useNavigate();
  const { mutate: createOffer, isPending } = useCreateJobOffer();
  const [categoryOpen, setCategoryOpen] = useState(false);

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
      scheduledAt: "",
      address: "",
      quantity: 1,
      amount: "",
      paymentFlow: "",
      note: "",
      categoryId: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: CreateJobOfferFormData) => {
    const payload: CreateJobOfferPayload = {
      title: data.title.trim(),
      description: data.description.trim(),
      scheduled_at: new Date(data.scheduledAt).toISOString(),
      address: data.address.trim(),
      quantity: data.quantity,
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
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date et heure *</FormLabel>
                <FormControl>
                  <Input type="datetime-local" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex : 123 Avenue de la Paix, Poto-Poto, Brazzaville"
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
                    {PAYMENT_FLOW_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PAYMENT_FLOW_LABELS[value]}
                      </SelectItem>
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
              render={({ field }) => {
                const selected = categories.find((c) => c.id === field.value);
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Catégorie (optionnel)</FormLabel>
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={categoryOpen}
                            disabled={isPending}
                            className={cn(
                              "w-full justify-between font-normal",
                              !selected && "text-muted-foreground",
                            )}
                          >
                            {selected ? selected.name : "Choisir une catégorie…"}
                            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-(--radix-popover-trigger-width) p-0"
                      >
                        <Command>
                          <CommandInput placeholder="Rechercher une catégorie…" />
                          <CommandList>
                            <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  value={category.name}
                                  onSelect={() => {
                                    field.onChange(
                                      category.id === field.value
                                        ? ""
                                        : category.id,
                                    );
                                    setCategoryOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 size-4",
                                      field.value === category.id
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {category.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
              onClick={() => navigate("/dashboard")}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
