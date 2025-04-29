"use client";

import { useState } from "react";

interface ContentfulTestProps {
  initialError: string | null;
}

export default function ContentfulTest({ initialError }: ContentfulTestProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(initialError);

  const testContentful = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/test-contentful");
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setError(null);
      }
    } catch (e: any) {
      setError(e.message || "An error occurred during the test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Contentful Connection Test</h2>

      <button
        onClick={testContentful}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {loading ? "Testing..." : "Test Contentful Connection"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <pre className="whitespace-pre-wrap text-sm mt-2">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          <h3 className="font-bold">Success!</h3>
          <div className="mt-2">
            <p>
              <strong>Space ID:</strong> {result.spaceId}
            </p>
            <p>
              <strong>Environment:</strong> {result.environment}
            </p>
            <p>
              <strong>Content Types:</strong> {result.contentTypes?.join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
