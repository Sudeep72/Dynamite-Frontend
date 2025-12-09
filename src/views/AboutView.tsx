import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const AboutView: React.FC = () => (
  <div className="max-w-5xl mx-auto">
    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">About Dynamite</h2>
    <p className="text-lg text-gray-600 mb-8">Project Information</p>

    <Card className="mb-8 shadow-md border-violet-200">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-violet-700">Dynamite</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base text-gray-700 mb-5">
          A professional AI-powered image analysis platform built with modern web technologies, focusing on speed and accuracy.
        </p>
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">
            <span className="text-gray-900 font-bold">Stack:</span> Next.js, TypeScript, Tailwind CSS, shadcn/ui
          </p>
          <p className="text-gray-600">
            <span className="text-gray-900 font-bold">Features:</span> Image upload, model training, similarity search, **live backend status**
          </p>
          <p className="text-gray-600">
            <span className="text-gray-900 font-bold">Version:</span> 1.0.0
          </p>
        </div>
      </CardContent>
    </Card>

    <Card className="shadow-md border-blue-200">
      <CardHeader>
        <h3 className="text-gray-900 font-bold text-lg">Backend Status</h3>
      </CardHeader>
      <CardContent>
        <p className="text-base text-gray-700 mb-3">
          The API server is currently running and accessible at:
        </p>
        <code className="text-base font-mono bg-blue-100 text-blue-700 p-2 rounded-lg block">
          http://94.136.191.91:5000/
        </code>
      </CardContent>
    </Card>
  </div>
);