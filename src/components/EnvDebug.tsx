"use client";

import { useState } from "react";

interface EnvDebugProps {
  spaceId: string;
  environment: string;
}

export default function EnvDebug({ spaceId, environment }: EnvDebugProps) {
  const [showing, setShowing] = useState(false);

  return (
    <div className="bg-gray-100 p-4 mt-4 rounded-lg">
      <button
        onClick={() => setShowing(!showing)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {showing ? "Hide" : "Show"} Environment Variables
      </button>

      {showing && (
        <div className="mt-2">
          <p>
            <strong>CONTENTFUL_SPACE_ID:</strong> {spaceId || "Not set"}
          </p>
          <p>
            <strong>CONTENTFUL_ENVIRONMENT:</strong> {environment || "Not set"}
          </p>
        </div>
      )}
    </div>
  );
}
