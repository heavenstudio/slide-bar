import { useState, useEffect } from 'react';
import { getOrganizationSettings, updateOrganizationSettings } from '../lib/api';
import type { OrganizationSettings } from '../lib/api';

/**
 * Settings Page
 * Manage organization-wide settings like default slide duration
 */
export default function Settings() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultDuration, setDefaultDuration] = useState('5.0');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrganizationSettings();
      setSettings(data);
      if (data) {
        setDefaultDuration((data.default_slide_duration / 1000).toString());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Erro ao carregar configurações: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const seconds = parseFloat(defaultDuration);
    if (isNaN(seconds) || seconds <= 0) {
      setError('Por favor, insira uma duração válida (maior que 0)');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSaveMessage(null);

      const durationMs = Math.round(seconds * 1000);
      await updateOrganizationSettings(durationMs);

      setSaveMessage('Configurações salvas com sucesso!');
      await loadSettings();

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Erro ao salvar configurações: ' + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
              <p className="mt-1 text-sm text-gray-500">
                Configure as preferências da sua organização
              </p>
            </div>
            <a href="/" className="text-sm text-blue-600 hover:text-blue-800">
              ← Voltar ao Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando configurações...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Configurações de Apresentação
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {saveMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{saveMessage}</p>
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="mb-6">
                <label
                  htmlFor="defaultDuration"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Duração Padrão para Novas Imagens
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="defaultDuration"
                    step="0.1"
                    min="0.1"
                    value={defaultDuration}
                    onChange={(e) => setDefaultDuration(e.target.value)}
                    className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                  <span className="text-gray-600">segundos</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Esta duração será aplicada automaticamente a todas as novas imagens enviadas. Você
                  ainda pode editar a duração de imagens individuais após o envio.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDefaultDuration((settings?.default_slide_duration || 5000) / 1000 + '')
                  }
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Informações</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • A duração padrão atual é de {(settings?.default_slide_duration || 5000) / 1000}{' '}
                  segundos
                </li>
                <li>• Imagens existentes mantêm suas durações configuradas</li>
                <li>• Você pode editar durações individuais no Dashboard</li>
                <li>• Use a edição em lote para atualizar múltiplas imagens de uma vez</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
