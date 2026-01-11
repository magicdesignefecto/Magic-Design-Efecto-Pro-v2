import { Table } from '../components/Table.js';
import { Modal } from '../components/Modal.js';
import { QuotesService } from '../services/quotes.service.js';
import { SettingsService } from '../services/settings.service.js'; // Conexión a Configuración Global
import { Formatters } from '../utils/formatters.js';

// ❌ AQUÍ BORRAMOS EL IMPORT DE LAYOUT

export const QuotesModule = {
    render: async () => {
        // 1. Obtener servicios globales
        const availableServices = await SettingsService.getServices();

        const servicesCheckboxesHTML = availableServices.map(svc => `
            <label class="service-option" style="display:flex;">
                <input type="checkbox" class="service-chk" value="${svc}">
                <span class="svc-name" style="margin-left:10px;">${svc}</span>
            </label>
        `).join('');

        const formHTML = `
            <style>
                .form-section { background: #F9FAFB; padding: 15px; border-radius: 8px; border: 1px solid #E5E7EB; margin-bottom: 15px; }
                .input-group { display: flex; flex-direction: column; gap: 12px; }
                .input-row { display: flex; gap: 10px; }
                .form-input, .form-select { width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.95rem; box-sizing: border-box; }
                
                /* Estilos Dropdown (Igual a Leads) */
                .dropdown-wrapper { position: relative; width: 100%; }
                .dropdown-trigger { width: 100%; padding: 10px; background: white; border: 1px solid #D1D5DB; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 0.95rem; color: #374151; }
                .dropdown-trigger:after { content: '▼'; font-size: 0.7rem; color: #6B7280; }
                .dropdown-content { display: none; position: absolute; top: 105%; left: 0; right: 0; background: white; border: 1px solid #D1D5DB; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 100; padding: 10px; }
                .dropdown-content.active { display: block; }
                .search-box { position: relative; margin-bottom: 8px; }
                .search-input { width: 100%; padding: 8px 8px 8px 30px; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 0.9rem; outline: none; }
                .search-icon { position: absolute; left: 8px; top: 8px; font-size: 0.9rem; color: #9CA3AF; }
                .services-list-scroll { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
                .service-option { padding: 8px; border-radius: 4px; cursor: pointer; transition: background 0.1s; }
                .service-option:hover { background: #F3F4F6; }

                /* Caja Verde Financiera */
                .total-box { background: #F0FDF4; border: 1px dashed #16A34A; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center; }
                .total-amount { color: #15803D; font-size: 1.8rem; font-weight: 800; display: block; }

                @media (max-width: 480px) {
                    .input-row { flex-direction: column; }
                    .money-row { flex-direction: row; }
                }
            </style>

            <form id="createQuoteForm">
                <!-- 1️⃣ DATOS DEL CLIENTE -->
                <div class="form-section">
                    <label style="font-weight:700; color:var(--primary); font-size:0.9rem;">👤 Información del Cliente</label>
                    <div class="input-group" style="margin-top:8px;">
                        <input type="text" name="client" id="inputClient" class="form-input" placeholder="Nombre del cliente *" required>
                        <input type="text" name="clientCompany" id="inputCompany" class="form-input" placeholder="Empresa (opcional)">
                        <div class="input-row">
                            <input type="text" name="clientPosition" id="inputPosition" class="form-input" placeholder="Cargo" style="flex:1;">
                            <input type="text" name="clientContact" id="inputContact" class="form-input" placeholder="WhatsApp/Email" style="flex:1;">
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:0.8rem; color:#666;">
                        <span>Fecha: <strong>${new Date().toLocaleDateString()}</strong></span>
                        <span>Cotización #: <strong>Auto</strong></span>
                    </div>
                </div>

                <!-- 2️⃣ SERVICIOS -->
                <div class="form-section">
                    <label style="font-weight:700; color:var(--primary); font-size:0.9rem; display:block; margin-bottom:5px;">🛠️ Servicios a Cotizar</label>
                    <div class="dropdown-wrapper">
                        <div class="dropdown-trigger" id="servicesDropdownTrigger">
                            <span id="servicesSelectedText">-- Seleccionar Servicios --</span>
                        </div>
                        <div class="dropdown-content" id="servicesDropdownContent">
                            <div class="search-box">
                                <span class="search-icon">🔍</span>
                                <input type="text" id="serviceSearchInput" class="search-input" placeholder="Buscar servicio...">
                            </div>
                            <div class="services-list-scroll" id="servicesListContainer">
                                ${servicesCheckboxesHTML}
                            </div>
                        </div>
                    </div>
                    <textarea name="serviceScope" id="inputScope" class="form-input" rows="3" placeholder="Alcance de los servicios (ej: Configuración de campañas, segmentación, creativos, optimización semanal...)" style="margin-top:10px;"></textarea>
                    <input type="text" name="duration" id="inputDuration" class="form-input" placeholder="Duración (ej: 30 días, 3 meses)" style="margin-top:8px;">
                </div>

                <!-- 3️⃣ CRONOGRAMA -->
                <div class="form-section">
                    <label style="font-weight:700; color:var(--primary); font-size:0.9rem;">📅 Cronograma de Trabajo</label>
                    <div class="input-group" style="margin-top:8px; font-size:0.85rem;">
                        <div class="input-row"><span style="width:80px; font-weight:600;">Semana 1:</span><input type="text" name="week1" id="inputWeek1" class="form-input" value="Setup y estrategia inicial" style="flex:1;"></div>
                        <div class="input-row"><span style="width:80px; font-weight:600;">Semana 2:</span><input type="text" name="week2" id="inputWeek2" class="form-input" value="Lanzamiento y optimización" style="flex:1;"></div>
                        <div class="input-row"><span style="width:80px; font-weight:600;">Semana 3:</span><input type="text" name="week3" id="inputWeek3" class="form-input" value="Escalado y ajustes" style="flex:1;"></div>
                        <div class="input-row"><span style="width:80px; font-weight:600;">Semana 4:</span><input type="text" name="week4" id="inputWeek4" class="form-input" value="Análisis y reporte final" style="flex:1;"></div>
                    </div>
                </div>

                <!-- 4️⃣ OBJETIVOS -->
                <div class="form-section">
                    <label style="font-weight:700; color:var(--primary); font-size:0.9rem;">🎯 Objetivos del Servicio</label>
                    <textarea name="objectives" id="inputObjectives" class="form-input" rows="3" style="margin-top:8px;">• Aumentar leads calificados
• Reducir costo por conversión
• Mejorar posicionamiento de marca</textarea>
                </div>

                <!-- 5️⃣ INVERSIÓN -->
                <div class="form-section" style="border-color:#BBF7D0; background:#F0FDF4;">
                    <h4 style="margin:0 0 10px 0; color:#15803D; font-size:0.9rem; font-weight:700;">💰 Inversión</h4>
                    <div class="input-group">
                        <div class="input-row money-row">
                            <div style="flex: 2;"><label style="font-size:0.7rem;">Monto</label><input type="number" id="inputInvest" class="form-input" placeholder="0.00"></div>
                            <div style="flex: 1;"><label style="font-size:0.7rem;">Moneda</label><select name="currency" id="inputCurrency" class="form-select" style="background:white;"><option value="BOB">BOB (Bs.)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option></select></div>
                        </div>
                        <div class="input-row money-row">
                            <div style="flex: 1;"><label style="font-size:0.7rem;">Descuento</label><input type="number" id="inputDiscount" class="form-input" placeholder="0"></div>
                            <div style="flex: 1;"><label style="font-size:0.7rem;">Tipo</label><select id="discountType" class="form-select" style="background:white;"><option value="amount">Monto ($)</option><option value="percent">Porcentaje (%)</option></select></div>
                        </div>
                        <div class="input-row">
                            <div style="flex:1;"><label style="font-size:0.7rem;">Periodicidad</label><select name="periodicity" id="inputPeriodicity" class="form-select" style="background:white;"><option value="unico">Pago único</option><option value="mensual">Mensual</option><option value="trimestral">Trimestral</option></select></div>
                        </div>
                    </div>
                    <div class="total-box"><span class="total-label">Total Cotizado</span><span id="displayTotal" class="total-amount">0.00</span></div>
                </div>

                <!-- 6️⃣ CONDICIONES -->
                <div class="form-section">
                    <label style="font-weight:700; color:var(--primary); font-size:0.9rem;">📋 Condiciones Comerciales</label>
                    <textarea name="conditions" id="inputConditions" class="form-input" rows="4" style="margin-top:8px; font-size:0.85rem;">• Validez de la cotización: 15 días
• Forma de pago: 50% inicio / 50% entrega
• No incluye presupuesto publicitario
• Inicio del servicio tras confirmación de pago</textarea>
                </div>

                <!-- BOTONES -->
                <div style="display:flex; gap:10px; margin-top:15px;">
                    <button type="button" id="btnPreviewPDF" class="btn-3d" style="flex:1; background:white; color:#333; border:1px solid #ccc;">📄 Ver PDF</button>
                    <button type="submit" class="btn-3d" style="flex:2; justify-content: center;">Guardar Cotización</button>
                </div>
            </form>
        `;

        const modalHTML = Modal.render('Nueva Cotización', formHTML, 'modalNewQuote');

        const pageContent = `
            <div class="page-header" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 5px;">Cotizaciones</h2>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Gestión de propuestas comerciales</p>
                </div>
                <button class="btn-3d" id="btnOpenQuoteModal">+ Nueva</button>
            </div>
            
            <div id="quotesTableContainer" style="overflow-x: auto;">
                <div style="text-align:center; padding:40px; color:#9CA3AF;">No hay cotizaciones registradas.</div>
            </div>
            
            ${modalHTML}
        `;

        // ❌ CAMBIO IMPORTANTE: Quitamos "Layout.render()"
        return pageContent;
    },

    init: async () => {
        Modal.initEvents('modalNewQuote');
        await QuotesModule.loadTable();

        const btnOpen = document.getElementById('btnOpenQuoteModal');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => {
                Modal.open('modalNewQuote');
                // Inicializar eventos del modal después de que esté abierto
                setTimeout(() => QuotesModule.initModalEvents(), 100);
            });
        }
    },

    // Inicializar eventos del modal (separado para ejecutar después de que el modal esté visible)
    initModalEvents: () => {

        // --- LÓGICA DROPDOWN (Igual a Leads) ---
        const trigger = document.getElementById('servicesDropdownTrigger');
        const content = document.getElementById('servicesDropdownContent');
        const searchInput = document.getElementById('serviceSearchInput');
        const selectedText = document.getElementById('servicesSelectedText');
        const listContainer = document.getElementById('servicesListContainer');

        if (trigger && content) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                content.classList.toggle('active');
                if (content.classList.contains('active')) searchInput.focus();
            });

            document.addEventListener('click', (e) => {
                if (!content.contains(e.target) && !trigger.contains(e.target)) content.classList.remove('active');
            });

            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                listContainer.querySelectorAll('.service-option').forEach(item => {
                    item.style.display = item.innerText.toLowerCase().includes(term) ? 'flex' : 'none';
                });
            });

            listContainer.addEventListener('change', () => {
                const count = listContainer.querySelectorAll('.service-chk:checked').length;
                selectedText.innerText = count > 0 ? `${count} Servicios seleccionados` : "-- Seleccionar Servicios --";
                selectedText.style.fontWeight = count > 0 ? 'bold' : 'normal';
                selectedText.style.color = count > 0 ? 'var(--primary)' : '#374151';
            });
        }

        // --- LÓGICA FINANCIERA (Igual a Leads) ---
        const inputInvest = document.getElementById('inputInvest');
        const inputDiscount = document.getElementById('inputDiscount');
        const discountType = document.getElementById('discountType');
        const displayTotal = document.getElementById('displayTotal');
        const inputCurrency = document.getElementById('inputCurrency');

        const calculateTotal = () => {
            const inv = Number(inputInvest.value) || 0;
            const discVal = Number(inputDiscount.value) || 0;
            const type = discountType.value;
            let finalDiscount = type === 'percent' ? inv * (discVal / 100) : discVal;
            const total = Math.max(0, inv - finalDiscount);
            displayTotal.innerText = `${inputCurrency.value} ${total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;
            return { total, finalDiscount };
        };

        if (inputInvest) {
            [inputInvest, inputDiscount, discountType, inputCurrency].forEach(el => {
                el.addEventListener('input', calculateTotal);
                el.addEventListener('change', calculateTotal);
            });
        }

        // --- GENERACIÓN PDF ---
        const btnPDF = document.getElementById('btnPreviewPDF');
        if (btnPDF) {
            btnPDF.addEventListener('click', () => {
                QuotesModule.generatePDF();
            });
        }

        // Guardar Cotización en Firebase
        const form = document.getElementById('createQuoteForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Obtener datos del formulario
                const client = document.getElementById('inputClient').value;
                const clientCompany = document.getElementById('inputCompany').value;
                const clientPosition = document.getElementById('inputPosition').value;
                const clientContact = document.getElementById('inputContact').value;

                const listContainer = document.getElementById('servicesListContainer');
                const selectedServices = Array.from(listContainer.querySelectorAll('.service-chk:checked')).map(cb => cb.value);
                const serviceScope = document.getElementById('inputScope').value;
                const duration = document.getElementById('inputDuration').value;

                // Cronograma
                const timeline = [
                    document.getElementById('inputWeek1').value,
                    document.getElementById('inputWeek2').value,
                    document.getElementById('inputWeek3').value,
                    document.getElementById('inputWeek4').value
                ];

                // Objetivos
                const objectives = document.getElementById('inputObjectives').value;

                // Financiero
                const investment = Number(document.getElementById('inputInvest').value) || 0;
                const discount = Number(document.getElementById('inputDiscount').value) || 0;
                const discountTypeVal = document.getElementById('discountType').value;
                const currency = document.getElementById('inputCurrency').value;
                const periodicity = document.getElementById('inputPeriodicity').value;

                // Condiciones
                const conditions = document.getElementById('inputConditions').value;

                // Calcular total
                let finalDiscount = discountTypeVal === 'percent' ? investment * (discount / 100) : discount;
                const total = Math.max(0, investment - finalDiscount);

                // Validar
                if (!client.trim()) {
                    Swal.fire('Error', 'Ingresa el nombre del cliente', 'error');
                    return;
                }
                if (selectedServices.length === 0) {
                    Swal.fire('Error', 'Selecciona al menos un servicio', 'error');
                    return;
                }

                try {
                    Swal.fire({
                        title: 'Guardando cotización...',
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading()
                    });

                    await QuotesService.create({
                        client: client.trim(),
                        clientCompany,
                        clientPosition,
                        clientContact,
                        services: selectedServices,
                        serviceScope,
                        duration,
                        timeline,
                        objectives,
                        investment,
                        discount,
                        discountType: discountTypeVal,
                        discountAmount: finalDiscount,
                        currency,
                        periodicity,
                        conditions,
                        total
                    });

                    Swal.fire({
                        icon: 'success',
                        title: '¡Cotización Guardada!',
                        text: `Cotización para ${client} creada exitosamente`,
                        timer: 2000,
                        showConfirmButton: false
                    });

                    Modal.close('modalNewQuote');
                    form.reset();
                    await QuotesModule.loadTable();
                } catch (error) {
                    console.error('Error:', error);
                    Swal.fire('Error', 'No se pudo guardar la cotización.', 'error');
                }
            });
        }
    },

    loadTable: async () => {
        const container = document.getElementById('quotesTableContainer');
        if (!container) return;

        try {
            const quotes = await QuotesService.getAll();

            if (quotes.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:40px; color:#9CA3AF;">No hay cotizaciones registradas.</div>';
                return;
            }

            container.innerHTML = `
                <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                    <thead>
                        <tr style="background:#F1F5F9; text-align:left;">
                            <th style="padding:12px; font-weight:600;">#</th>
                            <th style="padding:12px; font-weight:600;">Cliente</th>
                            <th style="padding:12px; font-weight:600;">Servicios</th>
                            <th style="padding:12px; font-weight:600;">Total</th>
                            <th style="padding:12px; font-weight:600;">Fecha</th>
                            <th style="padding:12px; font-weight:600;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quotes.map(q => `
                            <tr style="border-bottom:1px solid #E5E7EB;">
                                <td style="padding:12px; font-weight:700; color:var(--primary);">#${q.quoteNumber || '-'}</td>
                                <td style="padding:12px;">${q.client}</td>
                                <td style="padding:12px;">
                                    ${(q.services || []).slice(0, 2).map(s => `<span style="background:#EFF6FF; color:#1E40AF; padding:2px 6px; border-radius:4px; font-size:0.75rem; margin-right:4px;">${s}</span>`).join('')}
                                    ${q.services && q.services.length > 2 ? `<span style="color:#666;">+${q.services.length - 2}</span>` : ''}
                                </td>
                                <td style="padding:12px; font-weight:700; color:#059669;">${Formatters.toCurrency(q.total, q.currency)}</td>
                                <td style="padding:12px; color:#666;">${Formatters.toDate(q.createdAt)}</td>
                                <td style="padding:12px;">
                                    <button onclick="viewQuotePDF('${q.id}')" style="background:none; border:none; color:#3B82F6; cursor:pointer; padding:5px; font-size:0.85rem;" title="Ver PDF">
                                        <i class="fas fa-file-pdf"></i> PDF
                                    </button>
                                    <button onclick="deleteQuote('${q.id}')" style="background:none; border:none; color:#EF4444; cursor:pointer; padding:5px;" title="Eliminar">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Función global para eliminar cotización
            window.deleteQuote = async (id) => {
                const result = await Swal.fire({
                    title: '¿Eliminar cotización?',
                    text: 'Esta acción no se puede deshacer.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#EF4444',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    try {
                        await QuotesService.delete(id);
                        Swal.fire('Eliminada', 'La cotización ha sido eliminada.', 'success');
                        await QuotesModule.loadTable();
                    } catch (e) {
                        Swal.fire('Error', 'No se pudo eliminar.', 'error');
                    }
                }
            };

            // Función global para ver PDF de una cotización guardada
            window.viewQuotePDF = async (id) => {
                try {
                    const quote = await QuotesService.getById(id);
                    if (!quote) {
                        Swal.fire('Error', 'No se encontró la cotización', 'error');
                        return;
                    }
                    QuotesModule.generatePDFFromData(quote);
                } catch (e) {
                    Swal.fire('Error', 'No se pudo generar el PDF', 'error');
                }
            };
        } catch (error) {
            console.error('Error cargando cotizaciones:', error);
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#EF4444;">Error al cargar cotizaciones.</div>';
        }
    },

    // Generar PDF PROFESIONAL desde datos guardados
    generatePDFFromData: (quote) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;
        let yPos = margin;

        // ═══ 1️⃣ HEADER - LOGO + SLOGAN + CONTACTO ═══
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text("MAGIC DESIGN EFECTO", margin, 18);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text("Estudio de Estrategia Digital", margin, 25);
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.text('"Estrategia digital que convierte"', margin, 32);
        // Contacto derecha
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        const rightX = pageWidth - margin;
        doc.text("magicdesignefecto.com", rightX, 14, { align: 'right' });
        doc.text("+591 63212806", rightX, 20, { align: 'right' });
        doc.text("contacto@magicdesignefecto.com", rightX, 26, { align: 'right' });
        doc.text("La Paz - Bolivia", rightX, 32, { align: 'right' });
        yPos = 50;

        // ═══ TÍTULO ═══
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text("PROPUESTA COMERCIAL", margin, yPos);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Cotización #${quote.quoteNumber || '001'}  |  ${Formatters.toDate(quote.createdAt)}`, margin, yPos + 7);
        yPos += 18;

        // ═══ 2️⃣ CLIENTE ═══
        const clientHeight = quote.clientCompany || quote.clientContact ? 32 : 22;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, yPos, contentWidth, clientHeight, 3, 3, 'F');
        doc.setTextColor(100);
        doc.setFontSize(8);
        doc.text("CLIENTE", margin + 5, yPos + 6);
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(quote.client || 'Sin nombre', margin + 5, yPos + 14);
        if (quote.clientCompany || quote.clientPosition) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.text(`${quote.clientCompany || ''}${quote.clientPosition ? ' - ' + quote.clientPosition : ''}`, margin + 5, yPos + 20);
        }
        if (quote.clientContact) {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Contacto: ${quote.clientContact}`, margin + 5, yPos + 27);
        }
        yPos += clientHeight + 6;

        // ═══ 3️⃣ SERVICIOS ═══
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("SERVICIOS INCLUIDOS", margin, yPos);
        yPos += 6;
        doc.setDrawColor(200);
        doc.line(margin, yPos, margin + contentWidth, yPos);
        yPos += 4;
        if (quote.services && quote.services.length > 0) {
            quote.services.forEach((svc, i) => {
                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(226, 232, 240);
                doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'FD');
                doc.setTextColor(59, 130, 246);
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(`${i + 1}. ${svc}`, margin + 5, yPos + 6);
                doc.setTextColor(100);
                doc.setFontSize(8);
                doc.setFont(undefined, 'normal');
                const scopeText = quote.serviceScope ? quote.serviceScope.substring(0, 80) : '• Configuración y estrategia | • Optimización continua | • Reportes';
                doc.text(scopeText, margin + 8, yPos + 13);
                yPos += 20;
            });
        }
        yPos += 5;

        // ═══ 4️⃣ CRONOGRAMA ═══
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text("CRONOGRAMA", margin, yPos);
        yPos += 5;
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        const timeline = quote.timeline && quote.timeline.length === 4
            ? quote.timeline.map((t, i) => `Semana ${i + 1}: ${t}`)
            : ['Semana 1: Setup', 'Semana 2: Lanzamiento', 'Semana 3: Escalado', 'Semana 4: Reporte'];
        timeline.forEach(t => { doc.text(`• ${t}`, margin + 5, yPos); yPos += 4; });
        if (quote.duration) { doc.text(`Duración total: ${quote.duration}`, margin + 5, yPos); yPos += 4; }
        yPos += 5;

        // ═══ 5️⃣ OBJETIVOS ═══
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text("OBJETIVOS", margin, yPos);
        yPos += 5;
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        const objectivesList = quote.objectives
            ? quote.objectives.split('\n').filter(o => o.trim()).slice(0, 5)
            : ['• Aumentar leads', '• Reducir costos', '• Mejorar conversión'];
        objectivesList.forEach(o => { doc.text(o.startsWith('•') ? o : `• ${o}`, margin + 5, yPos); yPos += 4; });
        yPos += 5;

        // ═══ 6️⃣ INVERSIÓN ═══
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text("INVERSIÓN", margin + 5, yPos + 7);
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text("Subtotal:", margin + 5, yPos + 14);
        doc.text(`${Formatters.toCurrency(quote.investment, quote.currency)}`, margin + contentWidth - 5, yPos + 14, { align: 'right' });
        doc.setTextColor(220, 38, 38);
        doc.text("Descuento:", margin + 5, yPos + 20);
        doc.text(`- ${Formatters.toCurrency(quote.discountAmount || 0, quote.currency)}`, margin + contentWidth - 5, yPos + 20, { align: 'right' });
        doc.setTextColor(21, 128, 61);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("TOTAL:", margin + 5, yPos + 27);
        doc.text(`${Formatters.toCurrency(quote.total, quote.currency)}`, margin + contentWidth - 5, yPos + 27, { align: 'right' });
        yPos += 38;

        // ═══ 7️⃣ CONDICIONES ═══
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text("CONDICIONES", margin, yPos);
        yPos += 4;
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        const conditionsList = quote.conditions
            ? quote.conditions.split('\n').filter(c => c.trim()).slice(0, 5)
            : ['• Validez: 15 días', '• Pago: 50% inicio / 50% entrega', '• No incluye presupuesto ads', '• Inicio tras confirmación de pago'];
        conditionsList.forEach(c => { doc.text(c.startsWith('•') ? c : `• ${c}`, margin, yPos); yPos += 3.5; });
        if (quote.periodicity && quote.periodicity !== 'unico') {
            doc.text(`• Tipo de pago: ${quote.periodicity}`, margin, yPos);
            yPos += 3.5;
        }
        yPos += 6;

        // ═══ 8️⃣ CTA ═══
        doc.setFillColor(59, 130, 246);
        doc.roundedRect(margin, yPos, contentWidth, 12, 3, 3, 'F');
        doc.setTextColor(255);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text("Para iniciar: WhatsApp +591 63212806", pageWidth / 2, yPos + 8, { align: 'center' });
        yPos += 18;

        // ═══ 9️⃣ FIRMA ═══
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text("Diego Gonzales", margin, yPos);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text("CEO – Magic Design Efecto", margin, yPos + 5);

        // Footer
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
        doc.setTextColor(150);
        doc.setFontSize(7);
        doc.text("Magic Design Efecto © 2026 | magicdesignefecto.com | La Paz, Bolivia", pageWidth / 2, pageHeight - 5, { align: 'center' });

        doc.save(`Propuesta_${(quote.client || 'Cliente').replace(/\s+/g, '_')}_${quote.quoteNumber || ''}.pdf`);
    },

    // --- FUNCIÓN PDF PARA MÓVIL ---
    generatePDF: () => {
        const { jsPDF } = window.jspdf;

        // Formato más angosto para móvil (100mm x 200mm aprox)
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [100, 200] // Ancho móvil
        });

        const pageWidth = 100;
        const margin = 8;

        // Datos del Formulario
        const form = document.getElementById('createQuoteForm');
        const clientName = form.client.value || "Cliente General";
        const currency = document.getElementById('inputCurrency').value;
        const invest = Number(document.getElementById('inputInvest').value) || 0;

        // Calcular totales
        const discVal = Number(document.getElementById('inputDiscount').value) || 0;
        const discType = document.getElementById('discountType').value;
        let discountAmount = discType === 'percent' ? invest * (discVal / 100) : discVal;
        const total = Math.max(0, invest - discountAmount);

        // Servicios seleccionados
        const selectedServices = [];
        document.querySelectorAll('.service-chk:checked').forEach(chk => selectedServices.push(chk.value));

        let yPos = margin;

        // --- LOGO AREA (Placeholder) ---
        // El usuario puede reemplazar esto con su logo
        doc.setFillColor(59, 130, 246);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 15, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("MAGIC DESIGN", pageWidth / 2, yPos + 10, { align: 'center' });

        yPos += 22;

        // --- TÍTULO ---
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("COTIZACIÓN", pageWidth / 2, yPos, { align: 'center' });

        yPos += 8;

        // Fecha y número
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, yPos);
        doc.text(`#001`, pageWidth - margin, yPos, { align: 'right' });

        yPos += 8;

        // Línea divisoria
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        yPos += 6;

        // --- CLIENTE ---
        doc.setTextColor(100);
        doc.setFontSize(8);
        doc.text("CLIENTE:", margin, yPos);
        yPos += 4;
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(clientName, margin, yPos);

        yPos += 10;

        // --- SERVICIOS ---
        doc.setTextColor(100);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text("SERVICIOS:", margin, yPos);
        yPos += 5;

        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        if (selectedServices.length > 0) {
            selectedServices.forEach(svc => {
                doc.text(`• ${svc}`, margin + 2, yPos);
                yPos += 5;
            });
        } else {
            doc.text("(Sin servicios)", margin + 2, yPos);
            yPos += 5;
        }

        yPos += 8;

        // Línea divisoria
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        yPos += 6;

        // --- RESUMEN FINANCIERO ---
        // Fondo verde claro
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 30, 3, 3, 'F');

        yPos += 8;
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("Subtotal:", margin + 4, yPos);
        doc.setTextColor(30, 41, 59);
        doc.text(`${Formatters.toCurrency(invest, currency)}`, pageWidth - margin - 4, yPos, { align: 'right' });

        yPos += 6;
        doc.setTextColor(220, 38, 38);
        doc.text("Descuento:", margin + 4, yPos);
        doc.text(`- ${Formatters.toCurrency(discountAmount, currency)}`, pageWidth - margin - 4, yPos, { align: 'right' });

        yPos += 8;
        doc.setFontSize(11);
        doc.setTextColor(21, 128, 61);
        doc.setFont(undefined, 'bold');
        doc.text("TOTAL:", margin + 4, yPos);
        doc.text(`${Formatters.toCurrency(total, currency)}`, pageWidth - margin - 4, yPos, { align: 'right' });

        yPos += 15;

        // --- PIE ---
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.setFont(undefined, 'normal');
        doc.text("Cotización válida por 15 días", pageWidth / 2, yPos, { align: 'center' });

        // Guardar PDF
        doc.save(`Cotizacion_${clientName.replace(/\s+/g, '_')}.pdf`);
    },

    destroy: () => { }
};
