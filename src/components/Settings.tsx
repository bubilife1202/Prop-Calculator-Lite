import { Settings as SettingsIcon, Info, Github, ExternalLink } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-neon-yellow" />
        <h2 className="text-2xl font-bold text-white">Settings</h2>
      </div>

      {/* Info Card */}
      <div className="bg-bg-secondary border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-neon-blue mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold text-white">About Risk Sniper</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Risk Sniper is a professional prop trading risk management calculator designed
              to help traders calculate optimal position sizes based on their account balance
              and risk tolerance.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-300">How it works:</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li className="flex gap-2">
              <span className="text-neon-green">•</span>
              <span>Enter your account balance and risk percentage per trade</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neon-green">•</span>
              <span>Set your stop loss in pips</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neon-green">•</span>
              <span>Select your asset class (Forex, Gold, Indices, Crypto)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neon-green">•</span>
              <span>Get instant position size calculation and risk analysis</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <p className="text-xs text-gray-500">
            <strong className="text-neon-red">Warning:</strong> This tool is for educational
            purposes only. Always consult with a financial advisor before making trading decisions.
          </p>
        </div>
      </div>

      {/* Calculation Formula */}
      <div className="bg-bg-secondary border border-gray-800 rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold text-white">Calculation Formula</h3>
        <div className="bg-bg-tertiary rounded-lg p-4 font-mono text-sm text-gray-300">
          <div className="space-y-1">
            <div>Money at Risk = Balance × Risk%</div>
            <div className="border-t border-gray-700 my-2" />
            <div>Lot Size = Money at Risk ÷</div>
            <div className="ml-8">(Stop Loss Pips × Pip Value)</div>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-bg-secondary border border-gray-800 rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold text-white">Data Storage</h3>
        <p className="text-sm text-gray-400">
          Your settings and trade history are stored locally in your browser using localStorage.
          No data is sent to any server. Clearing your browser data will reset all settings.
        </p>
      </div>

      {/* Links */}
      <div className="bg-bg-secondary border border-gray-800 rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold text-white">Resources</h3>
        <div className="space-y-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-neon-blue transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>View on GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Version */}
      <div className="text-center text-xs text-gray-600">
        Risk Sniper v1.0.0
      </div>
    </div>
  );
}
