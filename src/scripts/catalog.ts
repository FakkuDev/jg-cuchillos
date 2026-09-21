document.addEventListener('DOMContentLoaded', () => {
  const filterPanel = document.getElementById('filter-panel');
  const toggleFiltersBtn = document.getElementById('toggle-filters');
  const cards = document.querySelectorAll('.knife-card-link') as NodeListOf<HTMLElement>;
  const modal = document.getElementById('knife-modal') as HTMLDialogElement;
  const modalContent = document.getElementById('modal-content-inner');
  const closeModalBtn = document.getElementById('close-modal');
  let currentUrl = new URL(window.location.href);

  if (toggleFiltersBtn && filterPanel) {
    toggleFiltersBtn.addEventListener('click', () => {
      filterPanel.classList.toggle('hidden');
    });
  }

  const inputs = document.querySelectorAll('.filter-input') as NodeListOf<HTMLInputElement>;
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      const activeFilters: Record<string, string[]> = {};
      inputs.forEach(i => {
        if (i.checked) {
          if (!activeFilters[i.dataset.type!]) activeFilters[i.dataset.type!] = [];
          activeFilters[i.dataset.type!].push(i.value);
        }
      });

      const newUrl = new URL(window.location.href);
      Object.keys(activeFilters).forEach(key => {
        newUrl.searchParams.set(key, activeFilters[key].join(','));
      });
      Object.keys(activeFilters).length === 0 ? newUrl.search = '' : null;

      window.history.pushState({}, '', newUrl);
      applyFilters(activeFilters);
    });
  });

  function applyFilters(activeFilters: Record<string, string[]>) {
    cards.forEach(card => {
      let visible = true;
      Object.keys(activeFilters).forEach(key => {
        const cardValue = card.dataset[key]?.toLowerCase() || '';
        if (!activeFilters[key].some((val: string) => cardValue.includes(val.toLowerCase()))) {
          visible = false;
        }
      });
      card.style.display = visible ? 'block' : 'none';
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const initialFilters: Record<string, string[]> = {};
  urlParams.forEach((value, key) => {
    initialFilters[key] = value.split(',');
    const inputsForKey = document.querySelectorAll(`.filter-input[data-type="${key}"]`) as NodeListOf<HTMLInputElement>;
    inputsForKey.forEach(input => {
      if (initialFilters[key].includes(input.value)) input.checked = true;
    });
  });
  if (Object.keys(initialFilters).length > 0) applyFilters(initialFilters);

  if (modal && modalContent) {
    document.querySelectorAll('.knife-card-link').forEach(link => {
      link.addEventListener('click', async (e: Event) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLAnchorElement;
        const href = target.href;

        window.history.pushState({ modal: href }, '', href);

        try {
          const response = await fetch(href);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const content = doc.getElementById('modal-content');

          if (content) {
            modalContent.innerHTML = content.innerHTML;
            modal.showModal();
            document.body.style.overflow = 'hidden';
          } else {
            window.location.href = href;
          }
        } catch (err) {
          window.location.href = href;
        }
      });
    });

    const closeModal = () => {
      modal.close();
      document.body.style.overflow = '';
      window.history.pushState({}, '', '/');
    };

    closeModalBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    window.addEventListener('popstate', (e) => {
      if (modal.open) closeModal();
    });
  }
});
