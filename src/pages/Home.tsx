import React, { useEffect } from "react";
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "form-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "submit-url"?: string;
        "fetch-url"?: string;
      };
    }
  }
}

function Home() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "../wp-content/plugins/form-viewer/dist/widget.umd.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <div style={{ width: "800px" }}>
        <form-viewer
          submit-url="https://api.airtable.com/v0/app9i3YvEiYbCo4XN/apps"
          fetch-url="https://api.airtable.com/v0/app9i3YvEiYbCo4XN/apps/recckvXXbcopEsAQO"
        ></form-viewer>
      </div>
    </div>
  );
}

export default Home;
