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

                const titleElement = item.querySelector('.accordion-item__title');
                const descriptionElement = item.querySelector('.accordion-item__description');

                if (titleElement) {
                    const titleTag = item.querySelector('.accordion-item__title-wrapper').tagName.toLowerCase();
                    const newTitleElement = document.createElement(titleTag);
                    newTitleElement.className = 'list-block-item__title';
                    newTitleElement.textContent = titleElement.textContent.trim();
                    listBlockItem.appendChild(newTitleElement);
                }

                if (descriptionElement) {
                    const newDescriptionElement = document.createElement('div');
                    newDescriptionElement.className = 'list-block-item__description';
                    newDescriptionElement.innerHTML = descriptionElement.innerHTML;
                    listBlockItem.appendChild(newDescriptionElement);
                }

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