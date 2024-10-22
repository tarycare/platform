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

// policies: {
//     label_ar: 'السياسات',
//     label_en: 'Policies',
//     descriptionـar: 'السياسات الخاصة بالموظفين',
//     description_en: 'Policies related to staff',
//     name: 'policies',
//     published: checked,
//     items: [
//         {
//             label_ar: 'الخصوصية',
//             label_en: 'Purpose',
//             icon: BookOpen,
//             name: 'doc-ai-policies-purpose',
//             prompt: `Write cleaning and maintenance department be as details as you can do not hold back:
// 1.⁠Purpose and goals.
// 2.⁠ ⁠Definitions
// 3.⁠ ⁠applicable Scope.
// 4.⁠ ⁠Policy standard.
// 5.⁠ ⁠Procedures details.
// 6.⁠ ⁠Responsibility and staff roles.
// 7.⁠ ⁠References.
// add points and title and group it together in headers and descriptions. at least 2000 words
// `,
//         },
//         {
//             label_ar: 'المسؤولية',
//             label_en: 'Responsibility',
//             icon: BookOpen,
//             name: 'doc-ai-policies-responsibility',
//             prompt: 'Responsibility of the policy',
//         },
//         {
//             label_ar: 'النطاق',
//             label_en: 'Scope',
//             icon: BookOpen,
//             name: 'doc-ai-policies-scope',
//             prompt: 'Scope of the policy',
//         },
//     ],
// },
export interface PolisiesTab {
    id: string
    icon: any
    label_ar: string
    label_en: string
    description_ar: string
    description_en: string
    name: string
    published: boolean
    items: {
        id: string
        label_ar: string
        label_en: string
        icon: any
        name: string
        prompt: string
        order: number
        published: boolean
    }[]
}

export interface PolicyItem {
    id: string
    label_ar: string
    label_en: string
    icon: any
    name: string
    prompt: string
    order: number
    published: boolean
}
