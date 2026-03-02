"use client"

import { PhoneInput as ReactPhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import { useTranslation } from "@/lib/i18n/context"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
}

export function PhoneInput({ value, onChange }: PhoneInputProps) {
  const { t } = useTranslation()

  return (
    <div className="phone-input-wrapper">
      <ReactPhoneInput
        defaultCountry="tr"
        value={value}
        onChange={onChange}
        placeholder={t("phoneNumber")}
        inputClassName="!h-10 !rounded-md !border-input !bg-background !text-sm !ring-offset-background"
        countrySelectorStyleProps={{
          buttonClassName:
            "!h-10 !rounded-md !border-input !bg-background !px-3",
        }}
      />
    </div>
  )
}
