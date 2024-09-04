(function() {
    function transformAccordionToGrid(section, columnCount, style) {
        const accordion = section.querySelector('.accordion-items-container');
        
        if (accordion) {
            const gridContainer = document.createElement('div');
            gridContainer.className = `grid-container accordion-list columns-${columnCount}`;
            
            const items = accordion.querySelectorAll('.accordion-item');
            
            items.forEach((item) => {
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item preFade';
                if (style === 'card') {
                    gridItem.classList.add('style-card');
                }
                
                const titleWrapper = item.querySelector('.accordion-item__title-wrapper');
                const descriptionElement = item.querySelector('.accordion-item__description');
                
                let title = '';
                let titleTag = 'div'; // Default to div if no header tag is found
                if (titleWrapper) {
                    titleTag = titleWrapper.tagName.toLowerCase();
                    const titleSpan = titleWrapper.querySelector('.accordion-item__title');
                    title = titleSpan ? titleSpan.textContent.trim() : titleWrapper.textContent.trim();
                }

                let description = '';
                let imageUrl = null;
                let imagePosition = 'before';

                if (descriptionElement) {
                    const paragraphs = descriptionElement.querySelectorAll('p');
                    const descriptionParts = [];

                    paragraphs.forEach((p, index) => {
                        const content = p.textContent.trim();
                        const imageUrlMatch = content.match(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i);

                        if (imageUrlMatch) {
                            imageUrl = imageUrlMatch[0].split('?')[0];
                            if (index === paragraphs.length - 1) {
                                imagePosition = 'after';
                            }
                        } else {
                            descriptionParts.push(content);
                        }
                    });

                    description = descriptionParts.join(' ');
                }
                
                let imageHtml = '';
                if (imageUrl) {
                    imageHtml = `<div class="grid-item__image"><img src="${imageUrl}" alt="${title}" /></div>`;
                }
                
                gridItem.innerHTML = `
                    ${imagePosition === 'before' ? imageHtml : ''}
                    <${titleTag} class="grid-item__title">${title}</${titleTag}>
                    <div class="grid-item__description">${description}</div>
                    ${imagePosition === 'after' ? imageHtml : ''}
                `;
                
                gridContainer.appendChild(gridItem);
            });
            
            const accordionParent = accordion.closest('.sqs-block-content');
            
            if (accordionParent) {
                accordionParent.innerHTML = '';
                accordionParent.appendChild(gridContainer);
                
                setTimeout(() => {
                    gridContainer.querySelectorAll('.preFade').forEach(element => {
                        element.classList.add('fadeIn');
                        element.style.opacity = '1';
                    });
                }, 100);
            }
        }
    }

    function processSections() {
        const globalMetaTag = document.querySelector('meta[squarehero-plugin="list-block"]');
        if (!globalMetaTag || globalMetaTag.getAttribute('enabled') !== 'true') {
            return;
        }

        const sections = document.querySelectorAll('.page-section');
        let transformedCount = 0;
        sections.forEach(section => {
            const sectionMetaTag = section.querySelector('meta[squarehero-feature="list-block"]');
            if (sectionMetaTag) {
                const columns = sectionMetaTag.getAttribute('columns') || '3';
                const style = sectionMetaTag.getAttribute('style') || '';
                transformAccordionToGrid(section, columns, style);
                transformedCount++;
            }
        });
        if (transformedCount > 0) {
            console.log(`🚀 SquareHero.store List Block plugin loaded (${transformedCount} block${transformedCount > 1 ? 's' : ''} transformed)`);
        }
    }

    window.addEventListener('load', function() {
        setTimeout(processSections, 500);
    });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const addedNodes = mutation.addedNodes;
                addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('page-section')) {
                        const sectionMetaTag = node.querySelector('meta[squarehero-feature="list-block"]');
                        if (sectionMetaTag) {
                            const columns = sectionMetaTag.getAttribute('columns') || '3';
                            const style = sectionMetaTag.getAttribute('style') || '';
                            transformAccordionToGrid(node, columns, style);
                        }
                    }
                });
            }
        });
    });

    function startObserver() {
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            setTimeout(startObserver, 100);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startObserver);
    } else {
        startObserver();
    }
})();