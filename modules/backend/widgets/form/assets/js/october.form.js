/*
 * Form Widget
 *
 * Dependences:
 * - Nil
 */
+function ($) { "use strict";

    var FormWidget = function (element, options) {

        var $el = this.$el = $(element);

        this.options = options || {};

        this.bindDependants()
    }

    FormWidget.DEFAULTS = {
        refreshHandler: null
    }

    /*
     * Bind dependant fields
     */
    FormWidget.prototype.bindDependants = function() {
        var self = this,
            form = this.$el,
            formEl = form.closest('form'),
            fieldMap = {}

        /*
         * Map master and slave field map
         */
        form.find('[data-field-depends]').each(function(){
            var name = $(this).data('column-name'),
                depends = $(this).data('field-depends')

            $.each(depends, function(index, depend){
                if (!fieldMap[depend])
                    fieldMap[depend] = { fields: [] }

                fieldMap[depend].fields.push(name)
            })
        })

        /*
         * When a master is updated, refresh its slaves
         */
        $.each(fieldMap, function(columnName, toRefresh){
            form.find('[data-column-name="'+columnName+'"]')
                .on('change', 'select, input', function(){
                    formEl.request(self.options.refreshHandler, {
                        data: toRefresh
                    })

                    $.each(toRefresh.fields, function(index, field){
                        form.find('[data-column-name="'+field+'"]')
                            .addClass('loading-indicator-container size-form-field')
                            .loadIndicator()
                    })
                })
        })


        // dependants.on('change', 'select, input', function(){
        //     var depends = $(this).closest('[data-field-depends]').data('field-depends'),
        //         form = $(this).closest('form')

        //     if (!form.length || !self.options.refreshHandler)
        //         return

        //     form.request(self.options.refreshHandler)
        // })

    }


    // FORM WIDGET PLUGIN DEFINITION
    // ============================

    var old = $.fn.formWidget

    $.fn.formWidget = function (option) {
        var args = arguments,
            result

        this.each(function () {
            var $this   = $(this)
            var data    = $this.data('oc.formwidget')
            var options = $.extend({}, FormWidget.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.formwidget', (data = new FormWidget(this, options)))
            if (typeof option == 'string') result = data[option].call($this)
            if (typeof result != 'undefined') return false
        })

        return result ? result : this
      }

    $.fn.formWidget.Constructor = FormWidget

    // FORM WIDGET NO CONFLICT
    // =================

    $.fn.formWidget.noConflict = function () {
        $.fn.formWidget = old
        return this
    }

    // FORM WIDGET DATA-API
    // ==============
    
    $(document).render(function(){
        $('[data-control="formwidget"]').formWidget();
    })

}(window.jQuery);