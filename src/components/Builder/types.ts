// types.ts
export interface FieldOption {
    id: string
    order: number
    value: string
    label_en: string
    label_ar: string
}

export interface Field {
    id: string
    name: string
    label_en: string
    label_ar: string
    type: string
    placeholder_en: string
    placeholder_ar: string
    required?: boolean
    order: number
    colSpan?: number
    min?: number
    max?: number
    apidata?: object
    items?: FieldOption[]
}

export interface Section {
    id: string
    section_label_en: string
    section_label_ar: string
    section_description_en: string
    section_description_ar: string
    section_icon: string
    sectionName: string
    Fields: Field[]
    order: number
}

export interface FormConfig {
    sections: Section[]
}
