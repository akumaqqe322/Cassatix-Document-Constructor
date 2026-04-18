import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface ManualFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export function ManualForm({ data, onChange }: ManualFormProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const fields = [
    { id: 'clientName', label: 'Client Full Name', placeholder: 'e.g. Acme Corp LLC' },
    { id: 'caseNumber', label: 'Case / Matter Number', placeholder: 'e.g. 2024-CIV-001' },
    { id: 'caseType', label: 'Case Type', placeholder: 'e.g. COMMERCIAL_LITIGATION' },
    { id: 'courtName', label: 'Court / Jurisdiction', placeholder: 'e.g. Superior Court of California' },
    { id: 'registryRef', label: 'Registry Reference', placeholder: 'e.g. REG-1002' },
    { id: 'amountFormatted', label: 'Value / Amount', placeholder: 'e.g. USD 250,000' },
    { id: 'contractId', label: 'Contract / Agreement ID', placeholder: 'e.g. AGR-2024' },
    { id: 'openingDate', label: 'Opened Date', placeholder: 'e.g. 01/15/2024' },
    { id: 'description', label: 'Case Summary (description)', placeholder: 'Short description of the matter' },
    { id: 'powersDescription', label: 'Authority Scope (PoA)', placeholder: 'Describe powers granted' },
  ];

  return (
    <div className="h-[300px] px-1 overflow-y-auto">
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={field.id} className="text-xs">{field.label}</Label>
              <Input 
                id={field.id}
                placeholder={field.placeholder}
                value={data[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
