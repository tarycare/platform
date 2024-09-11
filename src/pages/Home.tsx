// @ts-nocheck
import DynamicForm from "@/FormBuilder";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function Home() {
  const { t, i18n } = useTranslation();

  const lang = document.documentElement.dir === "rtl" ? "ar" : "en";

  const handleSubmission = async (data: any) => {
    console.log("Submitting form data:", data);
    try {
      // Send the form data to an API or handle it as needed
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Form submitted successfully:", result);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Group the form fields into sections for Accordion
  //   const formSections = [
  //     {
  //       sectionTitle: "Personal Information",
  //       sectionDescription: "Enter your personal information",
  //       sectionIcon: "👤",
  //       notCollapsible: true,
  //       fields: [
  //         {
  //           name: "name",
  //           type: "text",
  //           label: "Name",
  //           placeholder: "Enter your full name",
  //           validation: {
  //             required: "Name is required",
  //             minLength: {
  //               value: 4,
  //               message: "Name must be at least 4 characters",
  //             },
  //             maxLength: {
  //               value: 12,
  //               message: "Name cannot be more than 12 characters",
  //             },
  //           },
  //         },
  //         {
  //           name: "national ID",
  //           type: "text",
  //           label: "National ID",
  //           placeholder: "Enter your National ID",
  //           allowedCharacters: "0-9",
  //           validation: {
  //             required: "National ID is required",
  //             minLength: {
  //               value: 4,
  //               message: "National ID must be at least 4 characters",
  //             },
  //             maxLength: {
  //               value: 12,
  //               message: "National ID cannot be more than 12 characters",
  //             },
  //           },
  //         },
  //         {
  //           name: "birthdate",
  //           type: "date",
  //           label: "Birthdate",
  //           placeholder: "Enter your birthdate",
  //           validation: {
  //             required: "Birthdate is required",
  //           },
  //         },
  //         {
  //           name: "gender",
  //           type: "radio",
  //           label: "Gender",
  //           items: [
  //             { value: "male", label: "Male" },
  //             { value: "female", label: "Female" },
  //           ],
  //           validation: {
  //             required: "Please select a gender",
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       sectionTitle: "Employee Information",
  //       sectionDescription: "Enter your employee information",
  //       sectionIcon: "👨‍💼",
  //       fields: [
  //         {
  //           name: "phone",
  //           type: "text",
  //           label: "Phone Number",
  //           placeholder: "Enter your phone number",
  //           allowedCharacters: "0-9",
  //           validation: {
  //             required: "Phone Number is required",
  //             pattern: {
  //               value: /^\d{10}$/,
  //               message: "Phone number must be 10 digits",
  //             },
  //             maxLength: {
  //               value: 10,
  //               message: "Phone number must be 10 digits",
  //             },
  //           },
  //         },
  //         {
  //           name: "email",
  //           type: "email",
  //           label: "Email",
  //           placeholder: "Enter your email",
  //           validation: {
  //             required: "Email is required",
  //             pattern: {
  //               value: /^\S+@\S+$/i,
  //               message: "Email is invalid",
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       sectionTitle: "Skills and Preferences",
  //       sectionDescription: "Select the framework and skills you have",
  //       sectionIcon: "🛠️",
  //       fields: [
  //         {
  //           name: "framework",
  //           type: "select",
  //           label: "Framework",
  //           placeholder: "Select a framework",
  //           items: [
  //             { value: "next.js", label: "Next.js" },
  //             { value: "sveltekit", label: "SvelteKit" },
  //             { value: "nuxt.js", label: "Nuxt.js" },
  //             { value: "remix", label: "Remix" },
  //             { value: "astro", label: "Astro" },
  //           ],
  //           validation: {
  //             required: "Please select a framework",
  //           },
  //         },
  //         {
  //           name: "skills",
  //           type: "multi-select",
  //           label: "Skills",
  //           placeholder: "Select your skills",
  //           items: [
  //             { value: "react", label: "React" },
  //             { value: "angular", label: "Angular" },
  //             { value: "vue", label: "Vue" },
  //             { value: "svelte", label: "Svelte" },
  //             { value: "ember", label: "Ember" },
  //           ],
  //           validation: {
  //             required: "Select at least one skill",
  //             min: 1,
  //             max: 3,
  //           },
  //         },
  //       ],
  //     },
  //   ];

  //   const formSectionsAr = [
  //     {
  //       sectionTitle: "المعلومات الشخصية",
  //       sectionDescription: "أدخل معلوماتك الشخصية",
  //       sectionIcon: "👤",
  //       notCollapsible: true,
  //       fields: [
  //         {
  //           name: "name",
  //           type: "text",
  //           component: "Input",
  //           label: "الاسم",
  //           placeholder: "أدخل الاسم الكامل",
  //           validation: {
  //             required: "الاسم مطلوب",
  //             minLength: {
  //               value: 4,
  //               message: "يجب أن يكون الاسم على الأقل 4 أحرف",
  //             },
  //             maxLength: {
  //               value: 12,
  //               message: "لا يمكن أن يزيد الاسم عن 12 حرفًا",
  //             },
  //           },
  //         },
  //         {
  //           name: "national ID",
  //           type: "text",
  //           component: "Input",
  //           label: "الرقم القومي",
  //           placeholder: "أدخل الرقم القومي",
  //           allowedCharacters: "0-9",
  //           validation: {
  //             required: "الرقم القومي مطلوب",
  //             minLength: {
  //               value: 4,
  //               message: "يجب أن يكون الرقم القومي على الأقل 4 أحرف",
  //             },
  //             maxLength: {
  //               value: 12,
  //               message: "لا يمكن أن يزيد الرقم القومي عن 12 حرفًا",
  //             },
  //           },
  //         },
  //         {
  //           name: "birthdate",
  //           type: "date",
  //           component: "DatePicker",
  //           label: "تاريخ الميلاد",
  //           placholder: "أدخل تاريخ الميلاد",
  //           validation: {
  //             required: "تاريخ الميلاد مطلوب",
  //           },
  //         },
  //       ],
  //     },

  //     {
  //       sectionTitle: "معلومات الموظف",
  //       sectionDescription: "لأننا نهتم بمعرفة المزيد عنك",
  //       sectionIcon: "👨‍💼",
  //       fields: [
  //         {
  //           name: "phone",
  //           type: "text",
  //           component: "Input",
  //           label: "رقم الهاتف",
  //           placeholder: "أدخل رقم هاتفك",
  //           allowedCharacters: "0-9",
  //           validation: {
  //             required: "رقم الهاتف مطلوب",
  //             pattern: {
  //               value: /^\d{10}$/,
  //               message: "يجب أن يتكون رقم الهاتف من 10 أرقام",
  //             },
  //             maxLength: {
  //               value: 10,
  //               message: "يجب أن يتكون رقم الهاتف من 10 أرقام",
  //             },
  //           },
  //         },
  //         {
  //           name: "email",
  //           type: "text",
  //           component: "Input",
  //           label: "البريد الإلكتروني",
  //           placeholder: "أدخل البريد الإلكتروني",
  //           validation: {
  //             required: "البريد الإلكتروني مطلوب",
  //             pattern: {
  //               value: /^\S+@\S+$/i,
  //               message: "البريد الإلكتروني غير صحيح",
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       sectionTitle: "المهارات والتفضيلات",
  //       sectionDescription: "لأن المهارات تهمنا",
  //       sectionIcon: "🛠️",
  //       fields: [
  //         {
  //           name: "framework",
  //           type: "combobox",
  //           component: "Combobox",
  //           placeholder: "اختر الإطار",
  //           label: "الإطار",
  //           items: [
  //             { value: "next.js", label: "Next.js" },
  //             { value: "sveltekit", label: "SvelteKit" },
  //             { value: "nuxt.js", label: "Nuxt.js" },
  //             { value: "remix", label: "Remix" },
  //             { value: "astro", label: "Astro" },
  //           ],
  //           validation: {
  //             required: "الرجاء اختيار إطار عمل",
  //           },
  //         },
  //         {
  //           name: "skills",
  //           type: "multi-select",
  //           component: "MultiSelect",
  //           placeholder: "حدد مهاراتك",
  //           label: "المهارات",
  //           items: [
  //             { value: "react", label: "React" },
  //             { value: "angular", label: "Angular" },
  //             { value: "vue", label: "Vue" },
  //             { value: "svelte", label: "Svelte" },
  //             { value: "ember", label: "Ember" },
  //           ],
  //           validation: {
  //             required: "اختر مهارة واحدة على الأقل",
  //             min: 1,
  //             max: 3,
  //           },
  //         },
  //       ],
  //     },
  //   ];

  const [formSections, setFormSections] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        "https://api.airtable.com/v0/app9i3YvEiYbCo4XN/apps/recckvXXbcopEsAQO",
        {
          method: "GET",
          headers: {
            Authorization:
              "Bearer pat4Qsb1Mw7JFJFh7.6c8455ef5b19cc8e9fc0f452a62bee582a4e04ac0cb954463b6acad99f72de5d",
          },
        }
      );
      const data = await response.json();
      const fields = data.fields;
      const JSONData = JSON.parse(fields.JSONData);
      setFormSections(JSONData.sections);
      console.log(JSONData, "JSONData");
    }
    fetchData();
  }, []);

  return (
    <div>
      <DynamicForm
        data={formSections}
        languge={lang}
        handleSubmission={handleSubmission}
      />
    </div>
  );
}

export default Home;
