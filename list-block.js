// ======================================================
//          SquareHero.store List Block plugin 
// ======================================================
(function () {
    function transformAccordionToListBlock(section, columnCount, styles, targetSelector) {
        let accordions;
        if (targetSelector) {
            accordions = section.querySelectorAll(targetSelector);
        } else {
            accordions = section.querySelectorAll('.sqs-block-accordion');
        }

        // Add the new classes to the parent .page-section
        section.classList.add(`list-block-col-${columnCount}`, 'sh-list-block');

        // Create a style element for targeted styles
        const styleElement = document.createElement('style');
        let targetedStyles = '';

        let baseStyles = `
            .accordion-items-container {
                display: grid !important;
                gap: 30px;
                grid-template-columns: repeat(${columnCount}, 1fr);
            }
            .accordion-divider {
                display: none;
            }
            .accordion-item__click-target {
                pointer-events: none;
                padding: 0 !important;
            }
            .accordion-icon-container {
                display: none;
            }
            .accordion-item__dropdown {
                display: block !important;
            }
            .accordion-item__description {
                padding-bottom: 0 !important;
            }
        `;

        // Add padding if card or card-border style is present
        if (styles.includes('card') || styles.includes('card-border')) {
            baseStyles += `
                .accordion-item {
                    padding: 20px;
                }
            `;
        }

        baseStyles += `
            @media (max-width: 768px) {
                .accordion-items-container {
                    grid-template-columns: 1fr;
                }
            }
        `;

        if (targetSelector) {
            targetedStyles = `${targetSelector} { ${baseStyles} }`;
        } else {
            targetedStyles = `.sh-list-block { ${baseStyles} }`;
        }

        styleElement.textContent = targetedStyles;
        document.head.appendChild(styleElement);

        accordions.forEach(accordion => {
            const listBlockContainer = document.createElement('div');
            listBlockContainer.className = `list-block-container accordion-list columns-${columnCount}`;
            styles.forEach(style => {
                listBlockContainer.classList.add(`style-${style}`);
            });

            const items = accordion.querySelectorAll('.accordion-item');

            items.forEach((item) => {
                const listBlockItem = document.createElement('div');
                listBlockItem.className = 'list-block-item preFade';
                styles.forEach(style => {
                    listBlockItem.classList.add(`style-${style}`);
                });

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
                let iconContent = null;

                if (descriptionElement) {
                    const content = descriptionElement.innerHTML;
                    const imageMatch = content.match(/https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg)/i);
                    if (imageMatch) {
                        const imgTag = `<img src="${imageMatch[0]}" alt="${title}" />`;
                        if (styles.includes('icons')) {
                            iconContent = imgTag;
                            description = content.replace(imageMatch[0], '').trim();
                        } else {
                            description = content.replace(imageMatch[0], imgTag);
                        }
                    } else {
                        description = content;
                    }
                }

                let contentHtml = '';
                if (styles.includes('icons')) {
                    contentHtml = `
                        <div class="list-block-item__content">
                            ${iconContent ? `<div class="list-block-item__icon">${iconContent}</div>` : ''}
                            <div class="list-block-item__text-wrapper">
                                <${titleTag} class="list-block-item__title">${title}</${titleTag}>
                                <div class="list-block-item__description">${description}</div>
                            </div>
                        </div>
                    `;
                } else {
                    contentHtml = `
                        <${titleTag} class="list-block-item__title">${title}</${titleTag}>
                        <div class="list-block-item__description">${description}</div>
                    `;
                }

                listBlockItem.innerHTML = contentHtml;

                listBlockContainer.appendChild(listBlockItem);
            });

            // Replace the accordion content with the new list block
            const accordionContent = accordion.querySelector('.sqs-block-content');
            if (accordionContent) {
                accordionContent.innerHTML = '';
                accordionContent.appendChild(listBlockContainer);
            }

            // Add fadeIn effect
            setTimeout(() => {
                listBlockContainer.querySelectorAll('.preFade').forEach(element => {
                    element.classList.add('fadeIn');
                    element.style.opacity = '1';
                });
            }, 100);
        });
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
                const stylesAttr = sectionMetaTag.getAttribute('style') || '';
                const styles = stylesAttr.split(',').map(s => s.trim()).filter(Boolean);
                const targetSelector = sectionMetaTag.getAttribute('target');
                transformAccordionToListBlock(section, columns, styles, targetSelector);
                transformedCount++;
            }
        });
        if (transformedCount > 0) {
            console.log(`🚀 SquareHero.store List Block plugin loaded (${transformedCount} section${transformedCount > 1 ? 's' : ''} transformed)`);
        }
    }

    window.addEventListener('load', function () {
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
                            const stylesAttr = sectionMetaTag.getAttribute('style') || '';
                            const styles = stylesAttr.split(',').map(s => s.trim()).filter(Boolean);
                            const targetSelector = sectionMetaTag.getAttribute('target');
                            transformAccordionToListBlock(node, columns, styles, targetSelector);
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