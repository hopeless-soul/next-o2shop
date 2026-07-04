import type { UseFormReturn } from 'react-hook-form'
import type { AddressDto } from '@/lib/types'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'

export const labelClass =
  'block font-sans text-[10px] uppercase tracking-widest mb-1 text-foreground-subtle'
export const inputClass =
  'w-full border border-border px-3 py-2 text-sm outline-none focus:border-current font-secondary text-foreground bg-background'

// Renders one AddressDto block (shipping or billing) bound to its own form instance.
export default function AddressFields({
  form,
  prefix,
}: {
  form: UseFormReturn<AddressDto>
  prefix: string
}) {
  const { control } = form

  /**
   * Note: Renders a single labeled input registered against `form`.
   * opts.optional only controls the label's trailing "*" — actual
   * required-ness is enforced by addressSchema, not by this flag.
   */
  function field(
    name: keyof AddressDto,
    label: string,
    opts?: { optional?: boolean; type?: string; className?: string },
  ) {
    return (
      <div className={opts?.className}>
        <label htmlFor={`${prefix}-${name}`} className={labelClass}>
          {label} {!opts?.optional && '*'}
        </label>
        <FormField
          control={control}
          name={name}
          render={({ field: rhfField }) => (
            /**
             * Note: className="contents" strips FormItem's own box so it doesn't
             * disrupt the surrounding grid layout; it's only here to satisfy
             * FormControl/FormMessage's context requirement.
             */
            <FormItem className="contents">
              <FormControl>
                <input
                  id={`${prefix}-${name}`}
                  type={opts?.type}
                  className={inputClass}
                  {...rhfField}
                  value={rhfField.value ?? ''}
                />
              </FormControl>
              <FormMessage className="mt-1 text-xs" />
            </FormItem>
          )}
        />
      </div>
    )
  }

  return (
    /**
     * Note: FormControl/FormMessage read the active field via useFormContext, so
     * each block needs its own form's context in scope, not just `control`.
     */
    <Form {...form}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('firstName', 'First name')}
        {field('lastName', 'Last name')}
        {field('company', 'Company', { optional: true, className: 'col-span-2' })}
        {field('address1', 'Address', { className: 'col-span-2' })}
        {field('address2', 'Apartment, suite, etc.', { optional: true, className: 'col-span-2' })}
        {field('city', 'City')}
        {field('province', 'State / Province')}
        {field('country', 'Country')}
        {field('postalCode', 'Postal code')}
        {field('phone', 'Phone', { type: 'tel', className: 'col-span-2' })}
      </div>
    </Form>
  )
}
