// @ts-nocheck
import FormViewer from "@/FormViewer";
import { Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoaded(true);
      setIsSubmitting(true);
      try {
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
      } catch (error) {
        console.error("Error fetching form data:", error);
        throw error;
      } finally {
        setIsLoaded(false);
        setIsSubmitting(false);
      }
    }
    fetchData();
  }, []);
  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }
  return (
    <div>
      {!isLoading && (
        <FormViewer
          data={formSections}
          languge={lang}
          handleSubmission={handleSubmission}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default Home;
