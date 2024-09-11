import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Personal Information

// Name
// Nationality
// Personal ID Number
// Phone Number
// Email
const resources = {
  en: {
    translation: {
      "Personal Information": "Personal Information",
      Name: "Name",
      "National ID": "National ID",
      "Phone Number": "Phone Number",
      Email: "Email",
    },
  },
  ar: {
    translation: {
      "Personal Information": "معلومات شخصية",
      Name: "الاسم",
      "National ID": "الرقم القومي",
      "Phone Number": "رقم الهاتف",
      Email: "البريد الالكتروني",
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
