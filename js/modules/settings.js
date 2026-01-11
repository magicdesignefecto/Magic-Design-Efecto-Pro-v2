import { UsersService } from '../services/users.service.js';
import { Store } from '../core/store.js';
import { auth, db } from '../core/firebase-config.js';
import { doc, updateDoc, collection, getDocs, addDoc, deleteDoc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export const SettingsModule = {
    render: async () => {
        // Obtener usuario actual - SIN RESTRICCIONES, todos tienen acceso
        const user = Store.getState().user;
        const currentTheme = localStorage.getItem('crm-theme') || 'light';

        // Cargar servicios existentes
        let servicesHtml = '<p style="color:#64748B;">Cargando servicios...</p>';
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                servicesHtml = '<p style="color:#64748B; text-align:center;">Inicia sesión para ver tus servicios.</p>';
            } else {
                // Consulta filtrada por userId - cada usuario ve SOLO sus servicios
                // Nota: No usamos orderBy para evitar necesitar índice compuesto
                const servicesQuery = query(
                    collection(db, "services"),
                    where("userId", "==", currentUser.uid)
                );
                const servicesSnap = await getDocs(servicesQuery);

                // Ordenamos en el cliente para evitar índice compuesto
                const sortedDocs = servicesSnap.docs.sort((a, b) =>
                    (a.data().name || '').localeCompare(b.data().name || '')
                );

                if (servicesSnap.empty) {
                    servicesHtml = '<p style="color:#64748B; text-align:center;">No hay servicios creados aún. ¡Agrega tu primer servicio!</p>';
                } else {
                    servicesHtml = sortedDocs.map(docSnap => {
                        const s = docSnap.data();
                        return `
                            <div class="service-item">
                                <div class="service-info">
                                    <strong>${s.name}</strong>
                                    <span class="service-price">Bs. ${s.price || 0}</span>
                                </div>
                                <div class="service-actions">
                                    <button class="btn-edit-service" onclick="editService('${docSnap.id}', '${s.name}', ${s.price || 0})" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-delete-service" onclick="deleteService('${docSnap.id}')" title="Eliminar">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }
        } catch (e) {
            console.error('Error cargando servicios:', e);
            servicesHtml = '<p style="color:#EF4444;">Error al cargar servicios. Puede que necesites crear un índice en Firebase.</p>';
        }

        return `
            <style>
                .settings-container { max-width: 1000px; margin: 0 auto; }
                
                /* Grid de secciones */
                .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px; }
                
                .settings-card { background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                .settings-card h4 { margin: 0 0 15px 0; color: #1E293B; font-size: 1rem; display: flex; align-items: center; gap: 10px; }
                .settings-card h4 i { color: #3B82F6; }
                
                /* Tema */
                .theme-toggle { display: flex; gap: 10px; }
                .theme-btn { flex: 1; padding: 12px; border: 2px solid #E2E8F0; border-radius: 10px; background: white; cursor: pointer; font-weight: 600; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .theme-btn.active { border-color: #3B82F6; background: #EFF6FF; color: #2563EB; }
                .theme-btn:hover { border-color: #3B82F6; }
                
                /* Perfil */
                .profile-section { display: flex; flex-direction: column; gap: 12px; }
                .profile-avatar-container { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
                .profile-avatar { width: 60px; height: 60px; border-radius: 50%; background: #3B82F6; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; overflow: hidden; }
                .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .btn-upload { background: #EFF6FF; color: #2563EB; border: 1px dashed #3B82F6; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; }
                .profile-input { width: 100%; padding: 10px 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 0.9rem; box-sizing: border-box; }
                .btn-save-profile { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 5px; }
                .btn-save-profile:hover { background: #059669; }
                
                /* Servicios */
                .services-section { max-height: 250px; overflow-y: auto; }
                .service-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #F8FAFC; border-radius: 8px; margin-bottom: 8px; }
                .service-info strong { color: #1E293B; }
                .service-price { background: #DCFCE7; color: #16A34A; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; margin-left: 10px; }
                .service-actions { display: flex; gap: 5px; }
                .btn-edit-service { background: none; border: none; color: #3B82F6; cursor: pointer; padding: 5px; }
                .btn-edit-service:hover { color: #1D4ED8; }
                .btn-delete-service { background: none; border: none; color: #EF4444; cursor: pointer; padding: 5px; }
                .btn-delete-service:hover { color: #DC2626; }
                .add-service-form { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
                .add-service-form input { flex: 1; min-width: 100px; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; }
                .btn-add-service { background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap; }
                
                /* Descargar */
                .btn-download { width: 100%; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; border: none; padding: 14px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1rem; transition: 0.3s; }
                .btn-download:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(59,130,246,0.4); }
                
                /* Usuarios pendientes */
                .section-header { margin: 25px 0 15px 0; border-top: 1px solid #E2E8F0; padding-top: 20px; }
                .section-header h3 { margin: 0; color: #1E293B; font-size: 1.1rem; }
                
                .user-card { background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
                .u-info { display: flex; gap: 12px; align-items: center; }
                .u-avatar { width: 40px; height: 40px; background: #3B82F6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
                .u-info h4 { margin: 0; color: #0F172A; font-size: 0.95rem; }
                .u-info p { margin: 2px 0; color: #64748B; font-size: 0.8rem; }
                .badge-role { background: #EEF2FF; color: #4F46E5; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
                
                .u-actions { display: flex; gap: 8px; }
                .btn-approve { background: #10B981; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
                .btn-deny { background: #FEE2E2; color: #EF4444; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
                
                .empty-state-mini { text-align: center; padding: 20px; color: #94A3B8; }
                .empty-state-mini i { font-size: 2rem; color: #CBD5E1; }
                
                @media (max-width: 600px) {
                    .settings-grid { grid-template-columns: 1fr; }
                    .user-card { flex-direction: column; gap: 15px; text-align: center; }
                    .u-info { flex-direction: column; }
                }
            </style>

            <div class="settings-container">
                <div class="settings-grid">
                    <!-- TEMA -->
                    <div class="settings-card">
                        <h4><i class="fas fa-palette"></i> Tema de la Aplicación</h4>
                        <div class="theme-toggle">
                            <button class="theme-btn ${currentTheme === 'light' ? 'active' : ''}" onclick="setTheme('light')">
                                <i class="fas fa-sun"></i> Claro
                            </button>
                            <button class="theme-btn ${currentTheme === 'dark' ? 'active' : ''}" onclick="setTheme('dark')">
                                <i class="fas fa-moon"></i> Oscuro
                            </button>
                        </div>
                    </div>
                    
                    <!-- PERFIL -->
                    <div class="settings-card">
                        <h4><i class="fas fa-user-edit"></i> Mi Perfil</h4>
                        <div class="profile-section">
                            <div class="profile-avatar-container">
                                <div class="profile-avatar" id="profileAvatar">
                                    ${user?.photoURL ? `<img src="${user.photoURL}" alt="Avatar">` : (user?.name?.charAt(0) || 'U')}
                                </div>
                                <label class="btn-upload">
                                    <i class="fas fa-camera"></i> Cambiar foto
                                    <input type="file" id="avatarInput" accept="image/*" style="display:none;">
                                </label>
                            </div>
                            <input type="text" class="profile-input" id="profileName" placeholder="Tu nombre" value="${user?.name || ''}">
                            <input type="text" class="profile-input" id="profileRole" placeholder="Tu cargo" value="${user?.role || ''}">
                            <button class="btn-save-profile" onclick="saveProfile()">
                                <i class="fas fa-save"></i> Guardar Cambios
                            </button>
                        </div>
                    </div>
                    
                    <!-- SERVICIOS -->
                    <div class="settings-card">
                        <h4><i class="fas fa-box"></i> Servicios / Productos</h4>
                        <div class="services-section" id="servicesList">
                            ${servicesHtml}
                        </div>
                        <div class="add-service-form">
                            <input type="text" id="newServiceName" placeholder="Nombre del servicio">
                            <input type="number" id="newServicePrice" placeholder="Precio Bs.">
                            <button class="btn-add-service" onclick="addService()">
                                <i class="fas fa-plus"></i> Agregar
                            </button>
                        </div>
                    </div>
                    
                    <!-- DESCARGAR -->
                    <div class="settings-card">
                        <h4><i class="fas fa-download"></i> Exportar Datos</h4>
                        <p style="color:#64748B; font-size:0.85rem; margin-bottom:15px;">Descarga todo el historial de clientes en formato Excel.</p>
                        <button class="btn-download" onclick="downloadClientsHistory()">
                        <i class="fas fa-file-excel"></i> Descargar Historial de Clientes
                        </button>
                    </div>
                </div>
            </div>
        `;
    },


    init: async () => {
        // ========== FUNCIÓN: CAMBIAR TEMA ==========
        window.setTheme = (theme) => {
            localStorage.setItem('crm-theme', theme);
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(`theme-${theme}`);

            // Actualizar botones visuales
            document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.theme-btn[onclick="setTheme('${theme}')"]`)?.classList.add('active');

            // Aplicar estilos de tema oscuro
            if (theme === 'dark') {
                document.documentElement.style.setProperty('--bg-main', '#0F172A');
                document.documentElement.style.setProperty('--bg-card', '#1E293B');
                document.documentElement.style.setProperty('--text-main', '#F1F5F9');
                document.documentElement.style.setProperty('--border-color', '#334155');
            } else {
                document.documentElement.style.setProperty('--bg-main', '#F8FAFC');
                document.documentElement.style.setProperty('--bg-card', '#FFFFFF');
                document.documentElement.style.setProperty('--text-main', '#1E293B');
                document.documentElement.style.setProperty('--border-color', '#E2E8F0');
            }
        };

        // Aplicar tema guardado al cargar
        const savedTheme = localStorage.getItem('crm-theme') || 'light';
        window.setTheme(savedTheme);

        // ========== FUNCIÓN: GUARDAR PERFIL ==========
        window.saveProfile = async () => {
            const name = document.getElementById('profileName').value.trim();
            const role = document.getElementById('profileRole').value.trim();

            if (!name) {
                Swal.fire('Error', 'El nombre es obligatorio.', 'warning');
                return;
            }

            try {
                const user = auth.currentUser;
                if (user) {
                    // Actualizar Auth
                    await updateProfile(user, { displayName: name });

                    // Actualizar Firestore
                    await updateDoc(doc(db, "users", user.uid), {
                        name: name,
                        role: role
                    });

                    // Actualizar Store local
                    const currentState = Store.getState();
                    Store.setState({
                        ...currentState,
                        user: { ...currentState.user, name, role }
                    });

                    Swal.fire('¡Guardado!', 'Tu perfil ha sido actualizado.', 'success');
                }
            } catch (e) {
                console.error('Error guardando perfil:', e);
                Swal.fire('Error', 'No se pudo guardar el perfil.', 'error');
            }
        };

        // ========== FUNCIÓN: SUBIR FOTO (Guardar en Firebase) ==========
        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
            avatarInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Validar tamaño (max 500KB para base64 en Firestore)
                    if (file.size > 500 * 1024) {
                        Swal.fire('Archivo muy grande', 'La imagen debe ser menor a 500KB', 'warning');
                        return;
                    }

                    // Mostrar loader
                    Swal.fire({
                        title: 'Subiendo imagen...',
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading()
                    });

                    // Convertir a base64
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        const base64Image = event.target.result;

                        try {
                            const user = auth.currentUser;
                            if (user) {
                                // Guardar en Firebase
                                await updateDoc(doc(db, "users", user.uid), {
                                    photoURL: base64Image
                                });

                                // Actualizar UI
                                const avatarEl = document.getElementById('profileAvatar');
                                if (avatarEl) {
                                    avatarEl.innerHTML = `<img src="${base64Image}" alt="Avatar">`;
                                }

                                // Actualizar header
                                const headerAvatar = document.querySelector('.user-avatar');
                                if (headerAvatar) {
                                    headerAvatar.innerHTML = `<img src="${base64Image}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                                }

                                Swal.fire({
                                    icon: 'success',
                                    title: '¡Foto actualizada!',
                                    timer: 1500,
                                    showConfirmButton: false
                                });
                            }
                        } catch (error) {
                            console.error('Error subiendo foto:', error);
                            Swal.fire('Error', 'No se pudo guardar la imagen.', 'error');
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // ========== FUNCIÓN: AGREGAR SERVICIO ==========
        window.addService = async () => {
            const nameInput = document.getElementById('newServiceName');
            const priceInput = document.getElementById('newServicePrice');
            const name = nameInput.value.trim();
            const price = parseFloat(priceInput.value) || 0;

            if (!name) {
                Swal.fire('Error', 'Ingresa el nombre del servicio.', 'warning');
                return;
            }

            try {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    Swal.fire('Error', 'Debes iniciar sesión.', 'error');
                    return;
                }

                await addDoc(collection(db, "services"), {
                    name: name,
                    price: price,
                    userId: currentUser.uid, // <-- CLAVE: Asociar al usuario
                    createdAt: new Date().toISOString()
                });

                nameInput.value = '';
                priceInput.value = '';

                Swal.fire('¡Agregado!', `Servicio "${name}" creado.`, 'success');

                // Recargar la página de configuración
                document.querySelector('a[href="#/settings"]')?.click();
            } catch (e) {
                console.error('Error agregando servicio:', e);
                Swal.fire('Error', 'No se pudo agregar el servicio.', 'error');
            }
        };

        // ========== FUNCIÓN: ELIMINAR SERVICIO ==========
        window.deleteService = async (serviceId) => {
            const result = await Swal.fire({
                title: '¿Eliminar servicio?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#EF4444',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "services", serviceId));
                    Swal.fire('Eliminado', 'El servicio ha sido eliminado.', 'success');
                    document.querySelector('a[href="#/settings"]')?.click();
                } catch (e) {
                    Swal.fire('Error', 'No se pudo eliminar.', 'error');
                }
            }
        };

        // ========== FUNCIÓN: EDITAR SERVICIO ==========
        window.editService = async (serviceId, currentName, currentPrice) => {
            const { value: formValues } = await Swal.fire({
                title: 'Editar Servicio',
                html: `
                    <div style="text-align:left;">
                        <label style="display:block; margin-bottom:5px; font-weight:600;">Nombre</label>
                        <input id="swal-name" class="swal2-input" placeholder="Nombre del servicio" value="${currentName}" style="margin:0 0 15px 0; width:100%;">
                        <label style="display:block; margin-bottom:5px; font-weight:600;">Precio (Bs.)</label>
                        <input id="swal-price" type="number" class="swal2-input" placeholder="0" value="${currentPrice}" style="margin:0; width:100%;">
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        name: document.getElementById('swal-name').value,
                        price: parseFloat(document.getElementById('swal-price').value) || 0
                    }
                }
            });

            if (formValues) {
                if (!formValues.name.trim()) {
                    Swal.fire('Error', 'El nombre es requerido.', 'error');
                    return;
                }

                try {
                    await updateDoc(doc(db, "services", serviceId), {
                        name: formValues.name.trim(),
                        price: formValues.price
                    });
                    Swal.fire('¡Actualizado!', 'El servicio ha sido modificado.', 'success');
                    document.querySelector('a[href="#/settings"]')?.click();
                } catch (e) {
                    console.error('Error editando servicio:', e);
                    Swal.fire('Error', 'No se pudo actualizar.', 'error');
                }
            }
        };

        // ========== FUNCIÓN: DESCARGAR HISTORIAL DE CLIENTES ==========
        window.downloadClientsHistory = async () => {
            try {
                Swal.fire({
                    title: 'Generando archivo...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                // Obtener todos los clientes
                const clientsSnap = await getDocs(collection(db, "clients"));

                if (clientsSnap.empty) {
                    Swal.fire('Sin datos', 'No hay clientes para exportar.', 'info');
                    return;
                }

                // Crear contenido CSV
                const headers = ['Nombre', 'Email', 'Teléfono', 'Estado', 'Servicio', 'Monto', 'Fecha Creación'];
                let csvContent = headers.join(',') + '\n';

                clientsSnap.docs.forEach(doc => {
                    const c = doc.data();
                    const row = [
                        `"${c.name || ''}"`,
                        `"${c.email || ''}"`,
                        `"${c.phone || ''}"`,
                        `"${c.status || ''}"`,
                        `"${c.service || ''}"`,
                        c.amount || 0,
                        `"${c.createdAt || ''}"`
                    ];
                    csvContent += row.join(',') + '\n';
                });

                // Descargar archivo
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `clientes_crm_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();

                Swal.fire('¡Descargado!', 'El archivo CSV ha sido generado.', 'success');
            } catch (e) {
                console.error('Error descargando:', e);
                Swal.fire('Error', 'No se pudo generar el archivo.', 'error');
            }
        };

        // ========== FUNCIONES: APROBAR/DENEGAR USUARIOS ==========
        window.approveUser = async (uid, name) => {
            const result = await Swal.fire({
                title: `¿Aprobar a ${name}?`,
                text: "Podrá acceder al CRM inmediatamente.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10B981',
                confirmButtonText: 'Sí, aprobar'
            });

            if (result.isConfirmed) {
                try {
                    await UsersService.updateStatus(uid, 'approved');
                    Swal.fire('¡Aprobado!', 'El usuario ya tiene acceso.', 'success');
                    document.querySelector('a[href="#/settings"]')?.click();
                } catch (e) {
                    Swal.fire('Error', 'No se pudo actualizar.', 'error');
                }
            }
        };

        window.denyUser = async (uid) => {
            const result = await Swal.fire({
                title: '¿Denegar acceso?',
                text: "El usuario quedará bloqueado.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#EF4444',
                confirmButtonText: 'Sí, denegar'
            });

            if (result.isConfirmed) {
                try {
                    await UsersService.updateStatus(uid, 'rejected');
                    Swal.fire('Denegado', 'Solicitud rechazada.', 'info');
                    document.querySelector('a[href="#/settings"]')?.click();
                } catch (e) {
                    Swal.fire('Error', 'No se pudo actualizar.', 'error');
                }
            }
        };
    }
};
