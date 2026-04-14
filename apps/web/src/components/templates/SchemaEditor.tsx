import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Code, 
  Eye, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { cn } from '../../lib/utils';

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  placeholder?: string;
}

interface Field {
  id: string;
  key: string;
  type: string;
  description: string;
  enum?: string[];
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({ value, onChange, title, placeholder }) => {
  const [mode, setMode] = useState<'visual' | 'json'>('visual');
  const [fields, setFields] = useState<Field[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Initialize fields from JSON value
  useEffect(() => {
    if (mode === 'visual') {
      try {
        const parsed = value.trim() ? JSON.parse(value) : { type: 'object', properties: {} };
        const properties = parsed.properties || {};
        const newFields: Field[] = Object.entries(properties).map(([key, prop]: [string, any]) => ({
          id: Math.random().toString(36).substr(2, 9),
          key,
          type: prop.type || 'string',
          description: prop.description || '',
          enum: prop.enum || undefined
        }));
        setFields(newFields);
        setJsonError(null);
      } catch (e) {
        // If JSON is invalid, stay in JSON mode or show error
        setJsonError("Invalid JSON structure. Switching to Code mode.");
        setMode('json');
      }
    }
  }, [mode === 'visual']);

  // Update JSON when fields change
  const updateJson = (newFields: Field[]) => {
    const properties: any = {};
    newFields.forEach(f => {
      if (f.key.trim()) {
        properties[f.key.trim()] = {
          type: f.type,
          description: f.description.trim() || undefined,
          enum: f.enum && f.enum.length > 0 ? f.enum : undefined
        };
      }
    });
    const newJson = JSON.stringify({ type: 'object', properties }, null, 2);
    onChange(newJson);
  };

  const addField = () => {
    const newFields = [...fields, { 
      id: Math.random().toString(36).substr(2, 9), 
      key: '', 
      type: 'string', 
      description: '' 
    }];
    setFields(newFields);
    updateJson(newFields);
  };

  const removeField = (id: string) => {
    const newFields = fields.filter(f => f.id !== id);
    setFields(newFields);
    updateJson(newFields);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    const newFields = fields.map(f => f.id === id ? { ...f, ...updates } : f);
    setFields(newFields);
    updateJson(newFields);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</Label>
        <div className="flex items-center bg-gray-100 p-0.5 rounded-md border border-gray-200">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={cn(
              "px-2 py-1 text-[10px] font-semibold rounded transition-all flex items-center gap-1.5",
              mode === 'visual' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Settings2 className="h-3 w-3" />
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode('json')}
            className={cn(
              "px-2 py-1 text-[10px] font-semibold rounded transition-all flex items-center gap-1.5",
              mode === 'json' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Code className="h-3 w-3" />
            Code
          </button>
        </div>
      </div>

      {mode === 'visual' ? (
        <div className="space-y-2">
          {fields.length === 0 ? (
            <div className="p-6 border border-dashed rounded-lg text-center bg-gray-50/50">
              <p className="text-xs text-gray-400 italic mb-3">No fields defined yet.</p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addField}
                className="h-8 text-[10px] font-bold uppercase tracking-wider"
              >
                <Plus className="mr-1.5 h-3 w-3" />
                Add First Field
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {fields.map((field) => (
                  <div key={field.id} className="p-3 bg-white border rounded-lg shadow-sm space-y-3 relative group">
                    <div className="flex items-start gap-2">
                      <div className="grid gap-1.5 flex-1">
                        <Input
                          placeholder="Field Key (e.g. clientName)"
                          value={field.key}
                          onChange={(e) => updateField(field.id, { key: e.target.value })}
                          className="h-8 text-xs font-mono bg-gray-50/50 border-gray-200"
                        />
                      </div>
                      <div className="w-[100px]">
                        <Select 
                          value={field.type} 
                          onValueChange={(v) => updateField(field.id, { type: v })}
                        >
                          <SelectTrigger className="h-8 text-xs bg-gray-50/50 border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="object">Object</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeField(field.id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Description (optional)"
                      value={field.description}
                      onChange={(e) => updateField(field.id, { description: e.target.value })}
                      className="h-8 text-xs bg-gray-50/50 border-gray-200"
                    />
                  </div>
                ))}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addField}
                className="w-full h-8 text-[10px] font-bold uppercase tracking-wider border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                <Plus className="mr-1.5 h-3 w-3" />
                Add Field
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-50/50 font-mono text-xs min-h-[200px] border-gray-200 focus:ring-gray-200"
          />
          {jsonError && (
            <div className="p-2 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-700 flex items-center gap-2">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {jsonError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
