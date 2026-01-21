import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Image as ImageIcon, Layout, Tag, Smartphone } from 'lucide-react';
import type { Phone } from '../../types';
import { parseGsmArenaHtml, parseGsmArenaHtmlFallback } from '../../utils/gsmParser';
import { ImageUploadModal } from './ImageUploadModal';

interface EditModalProps {
	phone: Phone;
	onSave: (phone: Phone) => void;
	onCancel: () => void;
}

type TabType = 'general' | 'specs' | 'media';

export function EditModal({ phone, onSave, onCancel }: EditModalProps) {
	const [formData, setFormData] = useState<Phone>(phone);
	const [activeTab, setActiveTab] = useState<TabType>('general');
	const [htmlInput, setHtmlInput] = useState('');
	const [parseMessage, setParseMessage] = useState('');
	const [showImageUploadModal, setShowImageUploadModal] = useState(false);

	const handleChange = (field: keyof Omit<Phone, 'badges'>, value: string | number | boolean) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSpecsChange = (field: keyof Phone['specs'], value: string) => {
		setFormData((prev) => ({
			...prev,
			specs: {
				...prev.specs,
				[field]: value,
			},
		}));
	};

	const handleImageUploadSave = (imageData: string) => {
		setFormData((prev) => ({
			...prev,
			image: imageData,
		}));
		setShowImageUploadModal(false);
	};

	const handlePriceChange = (field: keyof Phone['price'], value: string) => {
		setFormData((prev) => ({
			...prev,
			price: {
				...prev.price,
				[field]: value,
			},
		}));
	};

	// Função para processar HTML do GSMArena
	const handleProcessHtml = () => {
		if (!htmlInput.trim()) {
			setParseMessage('Por favor, cole o HTML primeiro.');
			return;
		}

		try {
			// Tenta primeiro com os data-spec (mais robusto)
			let parsed = parseGsmArenaHtml(htmlInput);

			// Se não encontrou dados suficientes, tenta o fallback
			if (Object.keys(parsed.specs || {}).length < 2) {
				parsed = parseGsmArenaHtmlFallback(htmlInput);
			}

			// Atualiza o formulário com os dados extraídos
			setFormData((prev) => {
				const updated = { ...prev };

				// Atualiza campo modelo se encontrado
				if (parsed.model) {
					updated.model = parsed.model;
				}

				// Atualiza imagem se encontrada
				if (parsed.image) {
					updated.image = parsed.image;
				}

				// Atualiza specs
				if (parsed.specs) {
					updated.specs = {
						...prev.specs,
						...parsed.specs,
					};
				}

				return updated;
			});

			// Mensagem de sucesso
			const fieldsFound = [];
			if (parsed.model) fieldsFound.push('Modelo');
			if (parsed.image) fieldsFound.push('Imagem');
			if (parsed.specs?.weight) fieldsFound.push('Peso');
			if (parsed.specs?.battery) fieldsFound.push('Bateria');
			if (parsed.specs?.screen) fieldsFound.push('Tela');
			if (parsed.specs?.chipset) fieldsFound.push('Chipset');
			if (parsed.specs?.ram) fieldsFound.push('RAM');
			if (parsed.specs?.storage) fieldsFound.push('Armazenamento');
			if (parsed.specs?.cameras) fieldsFound.push('Câmeras');
			if (parsed.specs?.dimensions) fieldsFound.push('Dimensões');

			if (fieldsFound.length > 0) {
				setParseMessage(`✓ Dados extraídos: ${fieldsFound.join(', ')}`);
			} else {
				setParseMessage('⚠ Nenhum dado encontrado.');
			}

			// Limpa o input após 3 segundos e fecha o details
			setTimeout(() => {
				setHtmlInput('');
				setParseMessage('');
				const detailsElement = document.getElementById('import-details') as HTMLDetailsElement;
				if (detailsElement) {
					detailsElement.open = false;
				}
			}, 2500);
		} catch (error) {
			setParseMessage('✗ Erro ao processar HTML.');
			console.error(error);
		}
	};

	const handleSave = () => {
		onSave(formData);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onCancel();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onCancel]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
			onClick={onCancel}
		>
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="bg-white rounded-lg shadow-lg max-w-2xl w-full flex flex-col max-h-[90vh]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-slate-200 p-4 bg-white rounded-t-lg">
					<h2 className="text-xl font-bold text-slate-900">Editar Celular</h2>
					<button
						onClick={onCancel}
						className="p-2 hover:bg-slate-100 rounded-lg transition"
						aria-label="Fechar modal"
					>
						<X className="w-5 h-5 text-slate-600" />
					</button>
				</div>

				{/* Navigation Tabs */}
				<div className="flex border-b border-slate-200 px-4 bg-slate-50">
					<button
						onClick={() => setActiveTab('general')}
						className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general'
							? 'border-blue-600 text-blue-600'
							: 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
							}`}
					>
						<Layout className="w-4 h-4" />
						Geral
					</button>
					<button
						onClick={() => setActiveTab('specs')}
						className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'specs'
							? 'border-blue-600 text-blue-600'
							: 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
							}`}
					>
						<Tag className="w-4 h-4" />
						Specs
					</button>
					<button
						onClick={() => setActiveTab('media')}
						className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'media'
							? 'border-blue-600 text-blue-600'
							: 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
							}`}
					>
						<ImageIcon className="w-4 h-4" />
						Mídia
					</button>
				</div>

				{/* Scrollable Content Area */}
				<div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

					{/* ABA GERAL */}
					{activeTab === 'general' && (
						<div className="space-y-6 animate-fadeIn">
							{/* Nome do Modelo */}
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Nome do Modelo
								</label>
								<input
									type="text"
									value={formData.model}
									onChange={(e) => handleChange('model', e.target.value)}
									className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="Ex: Galaxy S23"
									autoFocus
								/>
							</div>

							{/* Ano */}
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Ano de Lançamento
								</label>
								<input
									type="number"
									value={formData.year}
									onChange={(e) => handleChange('year', parseInt(e.target.value))}
									className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="2023"
								/>
							</div>

							{/* Preço */}
							<div className="space-y-3 p-4 bg-white rounded-lg border border-slate-200">
								<h3 className="font-semibold text-slate-900 flex items-center gap-2">
									<Tag className="w-4 h-4 text-blue-500" /> Preço
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-xs font-medium text-slate-500 mb-1">
											Parcelado
										</label>
										<input
											type="text"
											value={formData.price.installment}
											onChange={(e) => handlePriceChange('installment', e.target.value)}
											className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
											placeholder="12x R$..."
										/>
									</div>
									<div>
										<label className="block text-xs font-medium text-slate-500 mb-1">
											À Vista
										</label>
										<input
											type="text"
											value={formData.price.total}
											onChange={(e) => handlePriceChange('total', e.target.value)}
											className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
											placeholder="R$..."
										/>
									</div>
								</div>
							</div>

							{/* Destaque */}
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Destaque (Fator X)
								</label>
								<textarea
									value={formData.highlight}
									onChange={(e) => handleChange('highlight', e.target.value)}
									className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
									rows={2}
									placeholder="Ex: Design inovador & Câmera de 200MP"
								/>
							</div>

							{/* Badges */}
							<div className="space-y-3 p-4 bg-white rounded-lg border border-slate-200">
								<h3 className="font-semibold text-slate-900 flex items-center gap-2">
									<Smartphone className="w-4 h-4 text-blue-500" /> Badges
								</h3>
								<div className="grid grid-cols-3 gap-3">
									<div>
										<label className="block text-xs font-medium text-slate-500 mb-1">Rede</label>
										<select
											value={formData.badges.network}
											onChange={(e) => setFormData(prev => ({ ...prev, badges: { ...prev.badges, network: e.target.value as any } }))}
											className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white"
										>
											<option value="4G">4G</option>
											<option value="5G">5G</option>
											<option value="LTE">LTE</option>
										</select>
									</div>
									<div>
										<label className="block text-xs font-medium text-slate-500 mb-1">Resiliência</label>
										<select
											value={formData.badges.resilience}
											onChange={(e) => setFormData(prev => ({ ...prev, badges: { ...prev.badges, resilience: e.target.value as any } }))}
											className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white"
										>
											<option value="low">Baixa</option>
											<option value="medium">Média</option>
											<option value="high">Alta</option>
										</select>
									</div>
									<div>
										<label className="block text-xs font-medium text-slate-500 mb-1">Bateria</label>
										<select
											value={formData.badges.batteryStatus}
											onChange={(e) => setFormData(prev => ({ ...prev, badges: { ...prev.badges, batteryStatus: e.target.value as any } }))}
											className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white"
										>
											<option value="critical">Crítica</option>
											<option value="warning">Média</option>
											<option value="good">Boa</option>
											<option value="neutral">Neutra</option>
										</select>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* ABA SPECS */}
					{activeTab === 'specs' && (
						<div className="space-y-6 animate-fadeIn">

							{/* Importador GSMArena */}
							<details id="import-details" className="group border border-amber-200 rounded-lg bg-amber-50 overflow-hidden">
								<summary className="px-4 py-3 cursor-pointer hover:bg-amber-100 flex items-center justify-between font-semibold text-amber-900 group-open:bg-amber-100">
									<span className="flex items-center gap-2">
										<Download className="w-4 h-4" />
										Importar Dados do GSMArena
									</span>
									<span className="group-open:rotate-180 transition-transform">▼</span>
								</summary>

								<div className="border-t border-amber-200 p-4 space-y-3">
									<p className="text-xs text-amber-800">
										Cole o HTML da página de specs do GSMArena (Inspecionar Elemento no site).
									</p>
									<textarea
										value={htmlInput}
										onChange={(e) => setHtmlInput(e.target.value)}
										placeholder="Cole o HTML aqui..."
										className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono bg-white"
										rows={4}
									/>
									<div className="flex gap-2">
										<button
											onClick={handleProcessHtml}
											disabled={!htmlInput.trim()}
											className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm font-medium"
										>
											Processar
										</button>
									</div>
									{parseMessage && (
										<div className={`text-xs px-3 py-2 rounded-lg ${parseMessage.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
											{parseMessage}
										</div>
									)}
								</div>
							</details>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Tela</label>
									<input
										type="text"
										value={formData.specs.screen || ''}
										onChange={(e) => handleSpecsChange('screen', e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Ex: 6.8 inch P-OLED"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Chipset</label>
									<input
										type="text"
										value={formData.specs.chipset || ''}
										onChange={(e) => handleSpecsChange('chipset', e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Ex: Snapdragon 8 Gen 2"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">RAM</label>
									<input
										type="text"
										value={formData.specs.ram || ''}
										onChange={(e) => handleSpecsChange('ram', e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Ex: 8GB"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Armazenamento</label>
									<input
										type="text"
										value={formData.specs.storage || ''}
										onChange={(e) => handleSpecsChange('storage', e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Ex: 256GB"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Bateria</label>
									<input
										type="text"
										value={formData.specs.battery}
										onChange={(e) => handleSpecsChange('battery', e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Ex: 5000 mAh"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Peso</label>
									<input
										type="text"
										value={formData.specs.weight}
										onChange={(e) => handleSpecsChange('weight', e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Ex: 196g"
									/>
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-slate-700 mb-1">Câmeras</label>
									<input
										type="text"
										value={formData.specs.cameras || ''}
										onChange={(e) => handleSpecsChange('cameras', e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Ex: 200MP + 12MP + 10MP"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Dimensões</label>
									<input
										type="text"
										value={formData.specs.dimensions || ''}
										onChange={(e) => handleSpecsChange('dimensions', e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Ex: 163.4 x 78.1 mm"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Espessura</label>
									<input
										type="text"
										value={formData.specs.thickness || ''}
										onChange={(e) => handleSpecsChange('thickness', e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="Ex: 8.9 mm"
									/>
								</div>
							</div>
						</div>
					)}

					{/* ABA MÍDIA */}
					{activeTab === 'media' && (
						<div className="space-y-6 animate-fadeIn h-full flex flex-col">
							<div className="flex-1 flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-6 min-h-[300px]">
								{formData.image ? (
									<div className="relative group w-full h-full flex items-center justify-center">
										<img
											src={formData.image}
											alt="Preview"
											className="max-h-[300px] max-w-full object-contain rounded-lg shadow-md"
										/>
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
											<button
												onClick={() => setShowImageUploadModal(true)}
												className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold shadow-lg transform hover:scale-105 transition"
											>
												Trocar Imagem
											</button>
										</div>
									</div>
								) : (
									<div className="text-center space-y-3">
										<div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
											<ImageIcon size={32} />
										</div>
										<p className="text-slate-500 font-medium">Sem imagem definida</p>
										<button
											onClick={() => setShowImageUploadModal(true)}
											className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
										>
											Adicionar Imagem
										</button>
									</div>
								)}
							</div>

							<div className="bg-white p-4 rounded-lg border border-slate-200">
								<label className="block text-xs font-medium text-slate-500 mb-1">URL da Imagem (Opcional)</label>
								<div className="flex gap-2">
									<input
										type="url"
										value={formData.image}
										onChange={(e) => handleChange('image', e.target.value)}
										className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
										placeholder="https://..."
									/>
								</div>
								<p className="text-xs text-slate-400 mt-1">Cole um link direto ou use o botão acima para fazer upload.</p>
							</div>
						</div>
					)}

				</div>

				{/* Footer */}
				<div className="border-t border-slate-200 p-4 bg-white rounded-b-lg flex justify-between items-center">
					<div className="text-xs text-slate-400">
						{activeTab === 'general' && 'Informações básicas e vitrine.'}
						{activeTab === 'specs' && 'Ficha técnica detalhada.'}
						{activeTab === 'media' && 'Gerencie a imagem do produto.'}
					</div>
					<div className="flex gap-3">
						<button
							onClick={onCancel}
							className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium text-sm"
						>
							Cancelar
						</button>
						<button
							onClick={handleSave}
							className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium text-sm shadow-md hover:shadow-lg"
						>
							Salvar Alterações
						</button>
					</div>
				</div>
			</motion.div>

			{/* ImageUploadModal Integration */}
			{showImageUploadModal && (
				<ImageUploadModal
					currentImage={formData.image}
					onSave={handleImageUploadSave}
					onCancel={() => setShowImageUploadModal(false)}
				/>
			)}
		</motion.div>
	);
}
