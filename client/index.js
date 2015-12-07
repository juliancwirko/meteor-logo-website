// =========================
// Tool functions
// =========================

const dataURItoBlobData = function (dataURI) {
    const binary = atob(dataURI.split(',')[1]), array = [];
    for(var i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
    return new Uint8Array(array);
};

const openModal = function (e, tmpl, modalTemplate) {
    e.preventDefault();
    Session.set('modalTemplate', modalTemplate);
    $('html').css('overflow', 'hidden');
    tmpl.modalActive.set(true);
};

const blockLetters = function (e) {
    const checkKey = (e.keyCode === 46 || e.keyCode === 8 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105));
    if (!checkKey) {
        $(e.currentTarget).val('');
    };
}


// =========================
// Template: main
// =========================


Template.main.onCreated(function () {
    this.modalActive = new ReactiveVar(false);
});
Template.main.events({
    'click .js-choose-color'(e, tmpl) {
        openModal(e, tmpl, 'colorTmpl');
    },
    'click .js-set-up-svg'(e, tmpl) {
        openModal(e, tmpl, 'svgTmpl');
    },
    'click .js-set-up-png'(e, tmpl) {
        openModal(e, tmpl, 'pngTmpl');
    },
    'click .js-close-modal'(e, tmpl) {
        tmpl.modalActive.set(false);
        $('html').css('overflow', 'auto');
    },
    'click .js-download-svg-logo'(e, tmpl) {
        e.preventDefault();
        const svgElem = document.querySelector('#meteor-logo-svg svg');
        const doc = new XMLSerializer().serializeToString(svgElem);
        saveAs(new Blob([doc], {type: 'image/svg+xml;charset=utf-8'}), 'meteor-logo.svg');
    }
});
Template.main.helpers({
    isModalActive() {
        const tmpl = Template.instance();
        return tmpl.modalActive.get();
    }
});


// =========================
// Template: modal
// =========================


Template.modal.helpers({
    modalTemplate() {
        return Session.get('modalTemplate') || '';
    }
});


// =========================
// Template: colorTmpl
// =========================


Template.colorTmpl.helpers({
    isColorInput() {
        let inp = document.createElement('input');
        inp.setAttribute('type', 'color');
        return inp.type !== 'text';
    }
});
Template.colorTmpl.events({
    'change .js-choose-color-input'(e, tmpl) {
        const value = $(e.currentTarget).val();
        if (value && /^#(?:[0-9a-f]{3}){1,2}$/i.test(value)) {
            tmpl.$('.logo-custom svg').find('path').css('fill', value);
        }
    },
    'click .js-logo-choose'(e) {
        const svgPath = $(e.currentTarget).find('svg path');
        const fill = svgPath && svgPath.css('fill');
        let blazeView, tmpl;
        if (fill) {
            $('#meteor-logo-svg svg').find('path').css('fill', fill);
            blazeView = Blaze.getView(document.querySelector('.jumbo'));
            tmpl = blazeView && blazeView.templateInstance();
            tmpl.modalActive.set(false);
        }
    }
});


// =========================
// Template: pngTmpl
// =========================


Template.pngTmpl.events({
    'click .js-download-png-logo'(e, tmpl) {
        e.preventDefault();
        let domElem, clonedElem, width, height, pngHeightInput, pngWidthInput, blazeView, mainTmpl;
        pngWidthInput = $('[name=png-file-width]').val();
        pngHeightInput = $('[name=png-file-height]').val();
        domElem = document.querySelector('#meteor-logo-svg svg');
        clonedElem = domElem.cloneNode(true);
        if (_.isNumber(parseInt(pngHeightInput))) {
            width = clonedElem.setAttribute('width', pngWidthInput);
            height = clonedElem.setAttribute('height', '100%');
        }
        if (_.isNumber(parseInt(pngHeightInput))) {
            width = clonedElem.setAttribute('width', '100%');
            height = clonedElem.setAttribute('height', pngHeightInput);
        }
        if (_.isNumber(parseInt(pngHeightInput)) && _.isNumber(parseInt(pngHeightInput))) {
            width = clonedElem.setAttribute('width', pngWidthInput);
            height = clonedElem.setAttribute('height', pngHeightInput);
        }
        clonedElem.toDataURL('image/png', {
            callback: function (data) {
                saveAs(new Blob([dataURItoBlobData(data)], {type: 'image/png;charset=utf-8'}), 'meteor-logo.png');
                blazeView = Blaze.getView(document.querySelector('.jumbo'));
                mainTmpl = blazeView && blazeView.templateInstance();
                mainTmpl.modalActive.set(false);
            }
        });
    },
    'keyup [name=png-file-width]'(e) {
        blockLetters(e);
        $('[name=png-file-height]').attr('placeholder', 'auto');
        if ($(e.currentTarget).val() === '') {
            $('[name=png-file-height]').attr('placeholder', 'Height');
        }
    },
    'keyup [name=png-file-height]'(e) {
        blockLetters(e);
        $('[name=png-file-width]').attr('placeholder', 'auto');
        if ($(e.currentTarget).val() === '') {
            $('[name=png-file-width]').attr('placeholder', 'Width');
        }
    }
});