// @ts-nocheck
import DynamicForm from "@/FormBuilder";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function Home() {
  const { t, i18n } = useTranslation();

  const lang = document.documentElement.dir === "rtl" ? "ar" : "en";

  const handleSubmission = async (data: any) => {
    console.log("Submitting form data:", data);
    // try {
    //   // Send the form data to an API or handle it as needed
    //   const response = await fetch("/api/submit-form", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(data),
    //   });

    //   const result = await response.json();
    //   console.log("Form submitted successfully:", result);
    // } catch (error) {
    //   console.error("Error submitting form:", error);
    // }
  };
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
