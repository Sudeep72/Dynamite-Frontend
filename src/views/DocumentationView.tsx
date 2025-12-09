import React from 'react';
import { Upload, Cpu, TestTube } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const DocumentationView: React.FC = () => (
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-12 px-4">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
        Turn your documents into <span className="text-violet-600">insights.</span>
      </h2>
      <p className="text-lg sm:text-xl text-gray-600">
        Upload images to train your AI model and discover visual patterns
      </p>
    </div>

    <Card className="mb-10 shadow-lg border-blue-100">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-violet-700">API Endpoints</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {[
          { method: 'GET', endpoint: '/', description: 'Web UI is running here' },
          { method: 'POST', endpoint: '/api/upload', description: 'Upload images to start training data' },
          { method: 'POST', endpoint: '/api/start-train', description: 'Initiate the model training process' },
          { method: 'GET', endpoint: '/api/train-status/:id', description: 'Get training progress for a specific model ID' },
          { method: 'POST', endpoint: '/api/compare-image', description: 'Test the trained model by searching similar images' },
          { method: 'GET', endpoint: '/image', description: `Serve images from the backend: ${BACKEND_URL}/image/file.jpg` },
        ].map((item, i) => (
          <div key={i} className="flex flex-col sm:flex-row items-start gap-5 p-5 bg-blue-50 rounded-xl border border-blue-200"> 
            <span className={`px-3 py-1.5 text-sm font-mono rounded-lg font-bold flex-shrink-0 ${
              item.method === 'GET' ? 'bg-blue-500 text-white' : 'bg-violet-600 text-white'
            }`}>
              {item.method}
            </span>
            <div className="flex-1 min-w-0">
              <code className="text-gray-900 font-mono text-base break-all">{item.endpoint}</code>
              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {[
        { title: 'Upload', desc: 'Add your training images securely', icon: <Upload className="w-7 h-7" /> },
        { title: 'Train', desc: 'Build your AI model using efficient algorithms', icon: <Cpu className="w-7 h-7" /> },
        { title: 'Test', desc: 'Analyze and compare new data instantly', icon: <TestTube className="w-7 h-7" /> },
      ].map((item, i) => (
        <Card key={i} className="p-8 text-center shadow-md hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-5 text-violet-600">
            {item.icon}
          </div>
          <h4 className="text-gray-900 font-bold mb-3 text-lg">{item.title}</h4>
          <p className="text-gray-600 text-base">{item.desc}</p> 
        </Card>
      ))}
    </div>
  </div>
);