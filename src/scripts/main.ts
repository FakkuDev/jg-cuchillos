document.addEventListener('DOMContentLoaded', () => {
    const WHATSAPP_NUMBER = '5492634212157';

    // 1. Filtros mobile
    const toggleFiltersBtn = document.getElementById('toggle-filters');
    const filterPanel = document.getElementById('filter-panel');

    if (toggleFiltersBtn && filterPanel) {
        toggleFiltersBtn.addEventListener('click', () => {
            filterPanel.classList.toggle('hidden');
        });
    }

    // 2. Limpiar filtros
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-input').forEach((input: any) => input.checked = false);
            window.history.pushState({}, '', '/');
            window.location.reload();
        });
    }

    // 3. Lightbox Galería
    const lightbox = document.getElementById('gallery-lightbox');
    const galleryImg = document.getElementById('gallery-img') as HTMLImageElement;
    const galleryCaption = document.getElementById('gallery-caption');
    const galleryWa = document.getElementById('gallery-wa') as HTMLAnchorElement;
    const closeGallery = document.getElementById('close-gallery');

    document.querySelectorAll('.gallery-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const img = btn.querySelector('img');
            const name = btn.getAttribute('data-name') || '';
            const desc = btn.getAttribute('data-desc') || '';

            if (galleryImg && img) galleryImg.src = img.src;
            if (galleryCaption) galleryCaption.textContent = `${name} ${desc ? '- ' + desc : ''}`;
            if (galleryWa) {
                const waText = encodeURIComponent(`Hola, me interesa encargar un trabajo similar a "${name}".`);
                galleryWa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
            }

            lightbox?.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        lightbox?.classList.add('hidden');
        document.body.style.overflow = '';
    };

    closeGallery?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // 4. Formulario Contacto
    const btnWa = document.getElementById('btn-wa');
    const btnEmail = document.getElementById('btn-email');

    const getFormData = () => {
        const name = (document.getElementById('c-name') as HTMLInputElement)?.value || '';
        const email = (document.getElementById('c-email') as HTMLInputElement)?.value || '';
        const phone = (document.getElementById('c-phone') as HTMLInputElement)?.value || '';
        const msg = (document.getElementById('c-msg') as HTMLTextAreaElement)?.value || '';
        return { name, email, phone, msg };
    };

    btnWa?.addEventListener('click', () => {
        const { name, phone, msg } = getFormData();
        let text = `Hola, soy ${name}.`;
        if (phone) text += ` Mi teléfono es ${phone}.`;
        if (msg) text += ` ${msg}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    });

    btnEmail?.addEventListener('click', () => {
        const { name, email, phone, msg } = getFormData();
        const subject = encodeURIComponent(`Contacto desde la web - ${name}`);
        const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\n\nMensaje:\n${msg}`);
        window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
    });

    // 5. Fachada de videos de YouTube
    document.querySelectorAll('.video-facade').forEach(facade => {
        facade.addEventListener('click', () => {
            const url = facade.getAttribute('data-url') || '';
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
            if (videoId) {
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                iframe.allowFullscreen = true;
                iframe.className = "w-full h-full absolute inset-0";
                facade.innerHTML = '';
                facade.appendChild(iframe);
            }
        });
    });
});
