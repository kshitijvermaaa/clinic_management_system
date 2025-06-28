
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, RotateCcw } from 'lucide-react';

interface ToothSelection {
  tooth: string;
  parts: string[];
}

interface VisualTeethSelectorProps {
  selectedTeeth: ToothSelection[];
  onTeethChange: (teeth: ToothSelection[]) => void;
}

export const VisualTeethSelector: React.FC<VisualTeethSelectorProps> = ({ selectedTeeth, onTeethChange }) => {
  const [selectedMode, setSelectedMode] = useState('full');

  const toothParts = [
    { value: 'occlusal', label: 'Occlusal (Chewing Surface)', color: '#ef4444', shortLabel: 'O' },
    { value: 'mesial', label: 'Mesial (Front)', color: '#3b82f6', shortLabel: 'M' },
    { value: 'distal', label: 'Distal (Back)', color: '#10b981', shortLabel: 'D' },
    { value: 'buccal', label: 'Buccal (Cheek Side)', color: '#f59e0b', shortLabel: 'B' },
    { value: 'lingual', label: 'Lingual (Tongue Side)', color: '#8b5cf6', shortLabel: 'L' },
    { value: 'full', label: 'Full Tooth', color: '#dc2626', shortLabel: 'F' }
  ];

  const upperTeeth = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
  const lowerTeeth = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

  const isToothPartSelected = (tooth: string, part: string) => {
    const selection = selectedTeeth.find(s => s.tooth === tooth);
    return selection ? selection.parts.includes(part) : false;
  };

  const toggleToothPart = (tooth: string, part: string) => {
    const existingSelection = selectedTeeth.find(s => s.tooth === tooth);
    
    if (part === 'full') {
      if (existingSelection?.parts.includes('full')) {
        onTeethChange(selectedTeeth.filter(s => s.tooth !== tooth));
      } else {
        onTeethChange([
          ...selectedTeeth.filter(s => s.tooth !== tooth),
          { tooth, parts: ['full'] }
        ]);
      }
      return;
    }
    
    if (existingSelection) {
      if (existingSelection.parts.includes('full')) {
        onTeethChange(selectedTeeth.map(s => 
          s.tooth === tooth ? { ...s, parts: [part] } : s
        ));
      } else if (existingSelection.parts.includes(part)) {
        const newParts = existingSelection.parts.filter(p => p !== part);
        if (newParts.length === 0) {
          onTeethChange(selectedTeeth.filter(s => s.tooth !== tooth));
        } else {
          onTeethChange(selectedTeeth.map(s => 
            s.tooth === tooth ? { ...s, parts: newParts } : s
          ));
        }
      } else {
        onTeethChange(selectedTeeth.map(s => 
          s.tooth === tooth ? { ...s, parts: [...s.parts, part] } : s
        ));
      }
    } else {
      onTeethChange([...selectedTeeth, { tooth, parts: [part] }]);
    }
  };

  const clearSelection = () => {
    onTeethChange([]);
  };

  const ToothSVG = ({ toothNumber, isUpper }: { toothNumber: string; isUpper: boolean }) => {
    const getPartColor = (part: string) => {
      if (isToothPartSelected(toothNumber, part)) {
        return toothParts.find(p => p.value === part)?.color || '#dc2626';
      }
      return isToothPartSelected(toothNumber, 'full') ? '#dc2626' : '#ffffff';
    };

    const isSelected = selectedTeeth.some(s => s.tooth === toothNumber);

    return (
      <div className="relative group">
        <div className={`transition-all duration-300 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}>
          <svg 
            width="60" 
            height="75" 
            viewBox="0 0 60 75" 
            className={`rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
              isSelected 
                ? 'shadow-xl ring-2 ring-blue-500/50 bg-white' 
                : 'shadow-md hover:shadow-lg border border-slate-200 bg-white'
            }`}
          >
            {/* Background with better shadow */}
            <rect x="0" y="0" width="60" height="75" rx="12" fill="white" />
            
            {/* Tooth shape - more realistic with better proportions */}
            <path
              d="M 10 15 Q 10 10 15 10 L 45 10 Q 50 10 50 15 L 50 40 Q 50 60 30 60 Q 10 60 10 40 Z"
              fill="#fafafa"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            
            {/* Occlusal (Top) - improved shape and shadow */}
            <path
              d="M 15 10 Q 20 8 30 8 Q 40 8 45 10 L 40 18 Q 30 15 20 18 Z"
              fill={getPartColor('occlusal')}
              className="cursor-pointer hover:opacity-80 transition-all duration-200 drop-shadow-sm"
              stroke="#64748b"
              strokeWidth="0.5"
              onClick={(e) => {
                e.stopPropagation();
                toggleToothPart(toothNumber, 'occlusal');
              }}
            />
            
            {/* Mesial (Left/Front) - better definition */}
            <path
              d="M 10 15 Q 10 10 15 10 L 20 18 L 15 40 Q 10 35 10 30 Z"
              fill={getPartColor('mesial')}
              className="cursor-pointer hover:opacity-80 transition-all duration-200 drop-shadow-sm"
              stroke="#64748b"
              strokeWidth="0.5"
              onClick={(e) => {
                e.stopPropagation();
                toggleToothPart(toothNumber, 'mesial');
              }}
            />
            
            {/* Distal (Right/Back) - better definition */}
            <path
              d="M 45 10 Q 50 10 50 15 L 50 30 Q 50 35 45 40 L 40 18 Z"
              fill={getPartColor('distal')}
              className="cursor-pointer hover:opacity-80 transition-all duration-200 drop-shadow-sm"
              stroke="#64748b"
              strokeWidth="0.5"
              onClick={(e) => {
                e.stopPropagation();
                toggleToothPart(toothNumber, 'distal');
              }}
            />
            
            {/* Buccal (Cheek side) - improved positioning */}
            <path
              d="M 20 18 L 15 40 Q 20 45 25 40 L 25 22 Z"
              fill={getPartColor('buccal')}
              className="cursor-pointer hover:opacity-80 transition-all duration-200 drop-shadow-sm"
              stroke="#64748b"
              strokeWidth="0.5"
              onClick={(e) => {
                e.stopPropagation();
                toggleToothPart(toothNumber, 'buccal');
              }}
            />
            
            {/* Lingual (Tongue side) - improved positioning */}
            <path
              d="M 40 18 L 45 40 Q 40 45 35 40 L 35 22 Z"
              fill={getPartColor('lingual')}
              className="cursor-pointer hover:opacity-80 transition-all duration-200 drop-shadow-sm"
              stroke="#64748b"
              strokeWidth="0.5"
              onClick={(e) => {
                e.stopPropagation();
                toggleToothPart(toothNumber, 'lingual');
              }}
            />
            
            {/* Center area - larger and better defined */}
            <rect
              x="25"
              y="22"
              width="10"
              height="18"
              fill={getPartColor('full')}
              className="cursor-pointer hover:opacity-80 transition-all duration-200 drop-shadow-sm"
              stroke="#64748b"
              strokeWidth="0.5"
              rx="2"
              onClick={(e) => {
                e.stopPropagation();
                toggleToothPart(toothNumber, 'full');
              }}
            />
            
            {/* Full tooth overlay when fully selected */}
            {isToothPartSelected(toothNumber, 'full') && (
              <path
                d="M 10 15 Q 10 10 15 10 L 45 10 Q 50 10 50 15 L 50 40 Q 50 60 30 60 Q 10 60 10 40 Z"
                fill="#dc2626"
                fillOpacity="0.9"
                className="cursor-pointer drop-shadow-lg"
                onClick={() => toggleToothPart(toothNumber, 'full')}
              />
            )}
          </svg>
          
          {/* Tooth number - improved styling */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded-full min-w-[28px] text-center shadow-lg">
            {toothNumber}
          </div>
          
          {/* Selection indicator - improved */}
          {isSelected && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            </div>
          )}
        </div>
        
        {/* Hover tooltip - improved */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
          Tooth {toothNumber}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-900">
            Visual Teeth Selector
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearSelection} className="flex items-center gap-2 shadow-sm">
              <RotateCcw className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Legend - improved styling */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-slate-700">Tooth Parts Guide:</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {toothParts.map((part) => (
              <div key={part.value} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div 
                  className="w-5 h-5 rounded-full border-2 border-slate-300 shadow-inner" 
                  style={{ backgroundColor: part.color }}
                />
                <span className="text-sm font-medium">{part.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 bg-blue-50 p-3 rounded-xl border border-blue-200">
            💡 Click on different parts of each tooth to select specific areas, or click the center for the full tooth.
          </p>
        </div>
        
        <Separator />
        
        {/* Upper Teeth - improved layout */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
            Upper Teeth (Maxilla)
          </h5>
          <div className="flex gap-3 flex-wrap justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-inner">
            {upperTeeth.map((tooth) => (
              <ToothSVG key={tooth} toothNumber={tooth} isUpper={true} />
            ))}
          </div>
        </div>

        {/* Lower Teeth - improved layout */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
            Lower Teeth (Mandible)
          </h5>
          <div className="flex gap-3 flex-wrap justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-inner">
            {lowerTeeth.map((tooth) => (
              <ToothSVG key={tooth} toothNumber={tooth} isUpper={false} />
            ))}
          </div>
        </div>

        {/* Selected Teeth Summary - improved styling */}
        {selectedTeeth.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-slate-700">Selected Teeth Summary:</h5>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                  {selectedTeeth.length} {selectedTeeth.length === 1 ? 'tooth' : 'teeth'}
                </Badge>
              </div>
              <div className="grid gap-3">
                {selectedTeeth.map((selection, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold text-blue-700">{selection.tooth}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selection.parts.map((part, partIndex) => (
                          <Badge 
                            key={partIndex} 
                            className="text-xs text-white border-0 shadow-sm"
                            style={{ 
                              backgroundColor: toothParts.find(p => p.value === part)?.color || '#dc2626' 
                            }}
                          >
                            {toothParts.find(p => p.value === part)?.shortLabel || part}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTeethChange(selectedTeeth.filter((_, i) => i !== index))}
                      className="text-slate-400 hover:text-red-500 p-2 h-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
