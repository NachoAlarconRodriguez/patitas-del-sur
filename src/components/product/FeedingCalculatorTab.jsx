import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Calculadora Nutricional de Ración Diaria (Formulario Multi-Pasos)
 * Extraída desde ProductDetailView para mantener la vista principal legible y modular.
 */
export default function FeedingCalculatorTab({
  product,
  isDog,
  wizardStep,
  setWizardStep,
  selectedLifeStage,
  setSelectedLifeStage,
  selectedBreedSize,
  setSelectedBreedSize,
  petWeight,
  setPetWeight,
  feedingGuide,
  activeFeedingRow,
  customFeedingGuide = null,
}) {
  const isCatConditionsGuide = customFeedingGuide?.type === 'cat_conditions';
  const isWeightOnlyGuide = customFeedingGuide?.type === 'weight_only';
  const effectiveWizardStep = isWeightOnlyGuide && (wizardStep === 1 || wizardStep === 2) ? 3 : wizardStep;
  const conditionOptions = isCatConditionsGuide && Array.isArray(customFeedingGuide.conditions)
    ? customFeedingGuide.conditions
    : [
        { id: 'neutered', label: 'Esterilizado', subtitle: 'Mantenimiento indoor', icon: '🏠' },
        { id: 'intact', label: 'Entero', subtitle: 'Sin esterilizar', icon: '🐱' },
        { id: 'overweight', label: 'Control de Peso', subtitle: 'Sobrepeso (≥ 4,5 kg)', icon: '⚖️' },
      ];
  const selectedConditionMeta = conditionOptions.find((c) => c.id === selectedLifeStage) || conditionOptions[0];

  return (
    <div className="space-y-4 pt-1 animate-in fade-in duration-200">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Calculadora Nutricional de Ración Diaria
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {isCatConditionsGuide
              ? 'Guía oficial del fabricante según peso y condición corporal de tu gato adulto:'
              : isWeightOnlyGuide
              ? 'Guía oficial del fabricante según el peso actual de tu mascota:'
              : 'Completa los pasos para conocer la porción recomendada:'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          {customFeedingGuide?.cupLabel && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-black">
              🥣 {customFeedingGuide.cupLabel}
            </span>
          )}
          {product.targetStageLabel && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
              {product.targetStageLabel}
            </span>
          )}
        </div>
      </div>

      {/* Wizard Step Progress Tracker Bar */}
      {!isWeightOnlyGuide && (
      <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-full border border-slate-200 shadow-2xs">
        {/* Step 1 Pill */}
        <button
          type="button"
          onClick={() => setWizardStep(1)}
          className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full transition-all cursor-pointer ${
            effectiveWizardStep === 1
              ? 'bg-[#1D1D1F] text-white shadow-2xs'
              : effectiveWizardStep > 1 || effectiveWizardStep === 'result'
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'bg-white text-slate-400 border border-slate-200'
          }`}
        >
          <span>{effectiveWizardStep > 1 || effectiveWizardStep === 'result' ? '✓' : '1'}</span>
          <span>{isCatConditionsGuide ? 'Condición' : 'Etapa'}</span>
        </button>

        <div className="h-0.5 flex-grow bg-slate-200 rounded-full" />

        {/* Step 2 Pill (dogs adult/senior) */}
        {isDog && selectedLifeStage !== 'cachorro' && (
          <>
            <button
              type="button"
              onClick={() => selectedLifeStage && setWizardStep(2)}
              disabled={!selectedLifeStage}
              className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full transition-all cursor-pointer ${
                effectiveWizardStep === 2
                  ? 'bg-[#1D1D1F] text-white shadow-2xs'
                  : effectiveWizardStep > 2 || effectiveWizardStep === 'result'
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  : 'bg-white text-slate-400 border border-slate-200'
              }`}
            >
              <span>{effectiveWizardStep > 2 || effectiveWizardStep === 'result' ? '✓' : '2'}</span>
              <span>Raza</span>
            </button>
            <div className="h-0.5 flex-grow bg-slate-200 rounded-full" />
          </>
        )}

        {/* Step 3 Pill */}
        <button
          type="button"
          onClick={() => {
            if (selectedLifeStage && (!isDog || selectedLifeStage === 'cachorro' || selectedBreedSize)) {
              setWizardStep(3);
            }
          }}
          disabled={!selectedLifeStage}
          className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full transition-all cursor-pointer ${
            effectiveWizardStep === 3
              ? 'bg-[#1D1D1F] text-white shadow-2xs'
              : effectiveWizardStep === 'result'
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'bg-white text-slate-400 border border-slate-200'
          }`}
        >
          <span>{effectiveWizardStep === 'result' ? '✓' : isDog && selectedLifeStage !== 'cachorro' ? '3' : '2'}</span>
          <span>Peso</span>
        </button>
      </div>
      )}

      {/* PASO 1: Seleccionar Etapa de Vida o Condición del Gato */}
      {effectiveWizardStep === 1 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-center animate-in fade-in duration-200">
          <div className="space-y-0.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
              Paso 1 de {isDog ? '3' : '2'}
            </span>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">
              {isCatConditionsGuide
                ? '¿Cuál es la condición de tu Gato Adulto?'
                : `¿Cuál es la Etapa de Vida de tu ${isDog ? 'Perro' : 'Gato'}?`}
            </h4>
          </div>

          {isCatConditionsGuide ? (
            <div className="flex flex-wrap justify-center gap-2.5 py-1">
              {conditionOptions.map((cond) => (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setSelectedLifeStage(cond.id)}
                  className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[118px] cursor-pointer active:scale-95 ${
                    selectedLifeStage === cond.id
                      ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md ring-2 ring-[#F5BA13]/40 scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">{cond.icon || '🐱'}</span>
                  <div className="text-xs font-black">{cond.label}</div>
                  <div className="text-[9px] opacity-80 font-medium">{cond.subtitle}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2.5 py-1">
              <button
                type="button"
                onClick={() => setSelectedLifeStage('cachorro')}
                className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                  selectedLifeStage === 'cachorro'
                    ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md ring-2 ring-[#F5BA13]/40 scale-102'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">🐾</span>
                <div className="text-xs font-black">{isDog ? 'Cachorro' : 'Gatito'}</div>
                <div className="text-[9px] opacity-80 font-medium">2 - 12 meses</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLifeStage('adulto')}
                className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                  selectedLifeStage === 'adulto'
                    ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md ring-2 ring-[#F5BA13]/40 scale-102'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">🐕</span>
                <div className="text-xs font-black">Adulto</div>
                <div className="text-[9px] opacity-80 font-medium">1 - 7 años</div>
              </button>

              {isDog && (
                <button
                  type="button"
                  onClick={() => setSelectedLifeStage('senior')}
                  className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                    selectedLifeStage === 'senior'
                      ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md ring-2 ring-[#F5BA13]/40 scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">🦴</span>
                  <div className="text-xs font-black">Senior</div>
                  <div className="text-[9px] opacity-80 font-medium">7+ años</div>
                </button>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              disabled={!selectedLifeStage}
              onClick={() => {
                if (isDog && selectedLifeStage !== 'cachorro') {
                  setWizardStep(2);
                } else {
                  setWizardStep(3);
                }
              }}
              className={`px-4 py-2 rounded-full font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedLifeStage
                  ? 'bg-[#1D1D1F] text-white hover:bg-black hover:text-[#F5BA13] shadow-md active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Siguiente Paso</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: Seleccionar Tamaño de Raza */}
      {effectiveWizardStep === 2 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-center animate-in fade-in duration-200">
          <div className="space-y-0.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
              Paso 2 de 3
            </span>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">
              ¿Cuál es el Tamaño de Raza de tu Perro?
            </h4>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 py-1">
            <button
              type="button"
              onClick={() => setSelectedBreedSize('pequena')}
              className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                selectedBreedSize === 'pequena'
                  ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md ring-2 ring-[#F5BA13]/40 scale-102'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-2xl">🐩</span>
              <div className="text-xs font-black">Pequeña</div>
              <div className="text-[9px] opacity-80 font-medium">&lt; 10 kg</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedBreedSize('mediana')}
              className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                selectedBreedSize === 'mediana'
                  ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md ring-2 ring-[#F5BA13]/40 scale-102'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-2xl">🐕</span>
              <div className="text-xs font-black">Mediana</div>
              <div className="text-[9px] opacity-80 font-medium">10 - 25 kg</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedBreedSize('grande')}
              className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                selectedBreedSize === 'grande'
                  ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md ring-2 ring-[#F5BA13]/40 scale-102'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-2xl">🦮</span>
              <div className="text-xs font-black">Grande</div>
              <div className="text-[9px] opacity-80 font-medium">&gt; 25 kg</div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="px-3 py-1.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              ← Anterior
            </button>

            <button
              type="button"
              disabled={!selectedBreedSize}
              onClick={() => setWizardStep(3)}
              className={`px-4 py-2 rounded-full font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedBreedSize
                  ? 'bg-[#1D1D1F] text-white hover:bg-black hover:text-[#F5BA13] shadow-md active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Siguiente Paso</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Ingresar Peso de la Mascota */}
      {effectiveWizardStep === 3 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-center animate-in fade-in duration-200">
          <div className="space-y-0.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
              {isWeightOnlyGuide ? (customFeedingGuide?.stageLabel || 'Paso Único') : 'Último Paso'}
            </span>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">
              {isWeightOnlyGuide
                ? (customFeedingGuide?.weightPrompt || 'Ingresa el Peso Actual de tu Mascota')
                : 'Ingresa el Peso de tu Mascota'}
            </h4>
          </div>

          <div className="flex flex-col items-center gap-3 py-1">
            <div className="flex items-center border-2 border-slate-200 rounded-2xl bg-slate-50 p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setPetWeight(Math.max(1, (parseFloat(petWeight) || 1) - 1))}
                className="w-9 h-9 rounded-xl bg-white text-slate-800 font-black text-base flex items-center justify-center hover:bg-slate-100 shadow-2xs active:scale-95 cursor-pointer"
              >
                -
              </button>
              <div className="flex items-center px-3">
                <input
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={petWeight}
                  onChange={(e) => setPetWeight(e.target.value)}
                  className="w-14 text-center text-xl font-black text-slate-900 focus:outline-hidden"
                />
                <span className="text-sm font-bold text-slate-600 ml-1">kg</span>
              </div>
              <button
                type="button"
                onClick={() => setPetWeight((parseFloat(petWeight) || 0) + 1)}
                className="w-9 h-9 rounded-xl bg-white text-slate-800 font-black text-base flex items-center justify-center hover:bg-slate-100 shadow-2xs active:scale-95 cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Quick weight chips */}
            <div className="flex flex-wrap justify-center items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Comunes:</span>
              {(Array.isArray(customFeedingGuide?.quickWeights)
                ? customFeedingGuide.quickWeights
                : isDog
                ? [3, 8, 20, 35]
                : isCatConditionsGuide
                ? [2.5, 4, 5, 7]
                : [2, 4, 6]
              ).map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setPetWeight(w)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all border cursor-pointer ${
                    parseFloat(petWeight) === w
                      ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>
          </div>

          <div className={`pt-2 border-t border-slate-100 flex items-center ${isWeightOnlyGuide ? 'justify-center' : 'justify-between'}`}>
            {!isWeightOnlyGuide && (
              <button
                type="button"
                onClick={() => {
                  if (isDog && selectedLifeStage !== 'cachorro') {
                    setWizardStep(2);
                  } else {
                    setWizardStep(1);
                  }
                }}
                className="px-3 py-1.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ← Anterior
              </button>
            )}

            <button
              type="button"
              onClick={() => setWizardStep('result')}
              className="px-5 py-2.5 rounded-full font-black text-xs bg-[#1D1D1F] hover:bg-black text-white hover:text-[#F5BA13] hover:shadow-md hover:scale-102 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <span>🎯 Calcular Ración</span>
            </button>
          </div>
        </div>
      )}

      {/* VISTA RESULTADO */}
      {effectiveWizardStep === 'result' && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap text-xs font-black text-slate-800">
              <span className="text-slate-400">Mascota:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {isWeightOnlyGuide
                  ? (customFeedingGuide?.stageBadge || product.targetStageLabel || '🐾 Cachorro')
                  : isCatConditionsGuide
                  ? `${selectedConditionMeta.icon || '🐱'} ${selectedConditionMeta.label}`
                  : selectedLifeStage === 'cachorro'
                  ? '🐾 Cachorro'
                  : selectedLifeStage === 'adulto'
                  ? '🐕 Adulto'
                  : '🦴 Senior'}
              </span>
              {selectedBreedSize && !isWeightOnlyGuide && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                  {selectedBreedSize === 'pequena' ? '🐩 Pequeña' : selectedBreedSize === 'mediana' ? '🐕 Mediana' : '🦮 Grande'}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                ⚖️ {petWeight} kg
              </span>
            </div>

            <button
              type="button"
              onClick={() => setWizardStep(isWeightOnlyGuide ? 3 : 1)}
              className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 hover:bg-[#1D1D1F] hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              ✏️ Modificar
            </button>
          </div>

          {/* Highlight Banner */}
          {activeFeedingRow && (
            <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/70 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs transition-all">
              <div className="flex items-center gap-2.5 font-black text-xs sm:text-sm">
                <span className="p-2 rounded-lg text-[#1D1D1F] bg-[#F5BA13] text-xs">🎯</span>
                <div>
                  <div>Ración Sugerida ({petWeight} kg):</div>
                  <div className="text-[10px] font-normal opacity-80">
                    {activeFeedingRow.label}
                    {isCatConditionsGuide && selectedLifeStage === 'overweight' && !activeFeedingRow.hasDirectConditionValue
                      ? ' · En este peso se muestra referencia de mantenimiento esterilizado'
                      : ''}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs font-black text-emerald-600 self-start sm:self-auto">
                🟢 {activeFeedingRow.maint}
              </span>
            </div>
          )}

          {/* Feeding Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs bg-white">
            {isCatConditionsGuide ? (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Peso del Gato</th>
                    <th className={`px-3 py-2.5 ${selectedLifeStage === 'intact' ? 'bg-amber-100/80 text-slate-900' : ''}`}>
                      Entero (Mant.)
                    </th>
                    <th className={`px-3 py-2.5 ${!selectedLifeStage || selectedLifeStage === 'neutered' ? 'bg-amber-100/80 text-slate-900' : ''}`}>
                      Esterilizado
                    </th>
                    <th className={`px-3 py-2.5 ${selectedLifeStage === 'overweight' ? 'bg-amber-100/80 text-slate-900' : ''}`}>
                      Sobrepeso
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-semibold text-slate-700">
                  {feedingGuide.map((row) => {
                    const isActive = activeFeedingRow?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`transition-all duration-200 ${
                          isActive
                            ? 'bg-amber-100/70 font-black text-slate-900'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{row.label}</span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black text-[#1D1D1F] bg-[#F5BA13]">
                                ✓ Tu gato
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-3 py-2.5 ${selectedLifeStage === 'intact' ? 'font-black text-slate-900 bg-amber-50/70' : 'font-bold'}`}>
                          {row.intact || '—'}
                        </td>
                        <td className={`px-3 py-2.5 ${!selectedLifeStage || selectedLifeStage === 'neutered' ? 'font-black text-slate-900 bg-amber-50/70' : 'font-bold'}`}>
                          {row.neutered || '—'}
                        </td>
                        <td className={`px-3 py-2.5 ${selectedLifeStage === 'overweight' ? 'font-black text-slate-900 bg-amber-50/70' : 'font-bold'}`}>
                          {row.overweight || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Peso</th>
                    <th className="px-4 py-2.5">Ración Recomendada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-semibold text-slate-700">
                  {feedingGuide.map((row) => {
                    const isActive = activeFeedingRow?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`transition-all duration-200 ${
                          isActive
                            ? 'bg-amber-100/70 font-black text-slate-900'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span>{row.label}</span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black text-[#1D1D1F] bg-[#F5BA13]">
                                ✓ Mascota
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 font-bold">{row.maint}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {customFeedingGuide?.note && (
            <p className="text-[11px] text-slate-500 font-medium px-1">
              💡 {customFeedingGuide.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

