// pages/swagger.jsx
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-dist/swagger-ui.css"; // Default Swagger UI CSS

// Dynamically import SwaggerUI with SSR disabled.
const SwaggerUI = dynamic(
    () => import("swagger-ui-react").then((mod) => mod.default),
    { ssr: false }
);

const SwaggerPage = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // Only render on client

    return (
        <div style={{ height: "100vh" }}>
            <SwaggerUI
                url="/swagger.json"
                docExpansion="none"
                defaultModelExpandDepth={-1}
                deepLinking={true}
            />
        </div>
    );
};

export default SwaggerPage;
