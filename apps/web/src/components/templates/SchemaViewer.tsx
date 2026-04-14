import React from 'react';
import { Badge } from '../ui/badge';
import { Info, Code } from 'lucide-react';

interface SchemaViewerProps {
  schema: any;
  title: string;
  emptyMessage?: string;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema, title, emptyMessage = "No schema defined" }) => {
  const properties = schema?.properties || {};
  const propertyKeys = Object.keys(properties);

  if (propertyKeys.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
        <p className="text-xs text-gray-400 italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h4>
        <Badge variant="outline" className="text-[10px] font-mono bg-white">
          {propertyKeys.length} {propertyKeys.length === 1 ? 'Field' : 'Fields'}
        </Badge>
      </div>
      <div className="grid gap-2">
        {propertyKeys.map((key) => {
          const prop = properties[key];
          return (
            <div key={key} className="p-3 bg-white border rounded-lg shadow-sm hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-gray-900 truncate">{key}</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-gray-100 text-gray-600 border-none">
                      {prop.type || 'any'}
                    </Badge>
                  </div>
                  {prop.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {prop.description}
                    </p>
                  )}
                </div>
                {prop.enum && (
                  <div className="shrink-0 text-right">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter mb-1">Options</div>
                    <div className="flex flex-wrap justify-end gap-1">
                      {prop.enum.map((val: string) => (
                        <Badge key={val} variant="outline" className="text-[9px] h-4 px-1 bg-gray-50">
                          {val}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
