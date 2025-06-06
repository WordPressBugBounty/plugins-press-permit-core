jQuery(document).ready(function ($) {
    $('.pp_group-profile div.pp-group_members, .pp_net_group-profile div.pp-group_members, .permissions_page_presspermit-edit-permissions div.pp-group_members').show();
    $('#pp-add-permissions').show();
    $('#pp_current_roles').show();

    $("a.pp-show-groups").on('click', function () {
        $('#userprofile_groupsdiv_pp').show();
        return false;
    });

    // ========= Group Members / Managers toggle ========
    $(".pp-member-type > a").on('click', function () {
        $(".pp-member-type > a").parent().removeClass('agp-selected_agent').addClass('agp-unselected_agent');
        $(this).parent().removeClass('agp-unselected_agent').addClass('agp-selected_agent');
        $('div.pp-member-type').hide();
        presspermitShowClass($(this).attr('class'), $);
        return false;
    });

    // ========== Begin "Add Roles" UI scripts ==========
    var presspermitAllRoleData = [];
    var presspermitEID = -1;

    $(".pp-add-permissions > a").on('click', function () {
        $(".pp-add-permissions > a").parent().removeClass('agp-selected_agent').addClass('agp-unselected_agent');
        $(this).parent().removeClass('agp-unselected_agent').addClass('agp-selected_agent');
        $('div.pp-add-permissions').hide();
        presspermitShowClass($(this).attr('class'), $);
    });

    $("#pp_save_roles input.button-primary").on('click', function () {
        $('input[name="member_csv"]').val($("input#member_csv").val());
        $('input[name="group_name"]').val($("input#group_name").val());
        $('input[name="description"]').val($("input#description").val());
        $(this).val(ppCred.submissionMsg).addClass('is-busy');
    });

    $('#agent-profile #submit').on('click', function (e) {
        // no need to submit selection inputs
        $('#pp_review_roles').hide();
        $('#pp_add_role').remove();
    });

    $(document).on('click', "#pp_tbl_role_selections .pp_clear", function (e) {
        var presspermitEID = $(this).closest('tr').find('input[name="pp_presspermitEID[]"]').val();

        if (typeof presspermitAllRoleData[presspermitEID] != 'undefined') {
            delete presspermitAllRoleData[presspermitEID];
        }

        $(this).closest('tr').remove();
        e.stopPropagation();
    });

    $('#pp_add_site_role').on('click', function () {
        $('div.pp-ext-promo').hide();

        var newrow = '', trackdata = '', duplicate = false, any_added = false;

        var conds = $('#pp_cond_ui').find('input[name="pp_select_cond[]"]:checked');

        if (conds.length == 0) {
            $('#pp_site_selection_msg').html(ppCred.noConditions);
            $('#pp_site_selection_msg').addClass('pp-error-note');
            $('#pp_site_selection_msg').show();
            return false;
        }

        $('.pp-save-roles').show();

        $(conds).each(function () {
            id = presspermitEscapeID(this.id);
            var lbl = $('#pp_add_role label[for="' + id + '"]');

            trackdata = $('select[name="pp_select_type"]').val()
                + '|' + $('select[name="pp_select_role"]').val()
                + '|' + $('#' + id).val()

            if ($.inArray(trackdata, presspermitAllRoleData) != -1) {
                duplicate = true;
            } else {
                presspermitEID++;
                presspermitAllRoleData[presspermitEID] = trackdata;

                newrow = 
                    '<tr><td>' + $('select[name="pp_select_type"] option:selected').html() + '</td>'
                    + '<td>' + $('select[name="pp_select_role"] option:selected').html() + '</td>'
                    + '<td>' + lbl.html() + '</td>'
                    + '<td><div class="pp_clear"><a href="javascript:void(0)" class="pp_clear">' + ppCred.clearRole + '</a></div>'
                    + '<input type="hidden" name="pp_presspermitEID[]" value="' + presspermitEID + '" />'
                    + '<input type="hidden" name="pp_add_role[' + presspermitEID + '][type]" value="' + $('select[name="pp_select_type"]').val() + '" />'
                    + '<input type="hidden" name="pp_add_role[' + presspermitEID + '][role]" value="' + $('select[name="pp_select_role"]').val() + '" />'
                    + '<input type="hidden" name="pp_add_role[' + presspermitEID + '][attrib_cond]" value="' + $('#' + id).val() + '" />';
                + '</td></tr>';

                $('#pp_tbl_role_selections tbody').append(newrow);

                any_added = true;
            }
        });

        if (duplicate && !any_added) {
            $('#pp_site_selection_msg').html(ppCred.alreadyRole);
            $('#pp_site_selection_msg').addClass('pp-error-note');
            $('#pp_site_selection_msg').show();
        } else {
            $('#pp_site_selection_msg').html(ppCred.pleaseReview);
            $('#pp_site_selection_msg').removeClass('pp-error-note');
            $('#pp_site_selection_msg').show();
        }

        return false;
    });

    var presspermitReloadRoles = function () {
        if ($('select[name="pp_select_type"]').val())
            presspermitAjaxUI('get_role_options', presspermitDrawRoles);
        else
            $('.pp-select-role').hide();
    }

    var presspermitReloadConditions = function () {
        if ($('select[name="pp_select_type"]').val() && $('select[name="pp_select_role"]').val())
            presspermitAjaxUI('get_conditions_ui', presspermitDrawConditions);
        else
            $('.pp-select-cond').hide();
    }

    $('select[name="pp_select_role"]').on('change', presspermitReloadConditions);

    $('select[name="pp_select_type"]').on('change', function () {
        $('#pp_add_role .postbox').hide();

        if ($(this).val() == 'site') {
            $('.pp-add-site-role').show();
        }

        presspermitReloadRoles();
    });

    var presspermitDrawRoles = function (data, txtStatus) {
        sel = $('select[name="pp_select_role"]');
        sel.html(data);
        sel.triggerHandler('change');

        if (sel.children().length) {
            $('.pp-select-role').show();
            $('.pp-add-site-role').show();
        } else {
            $('.pp-select-role').hide();
            $('.pp-add-site-role').hide();
        }

        presspermitAjaxUI_done();
    }

    var presspermitDrawConditions = function (data, txtStatus) {
        dv = $('#pp_cond_ui');
        dv.html(data);

        if (dv.children().length > 1)
            $('.pp-select-cond').show();
        else
            $('.pp-select-cond').hide();

        if ($('.pp-select-cond input:checkbox').length == 1) {
            $('.pp-select-cond input:checkbox').prop('checked', true);
        }

        presspermitAjaxUI_done();
    }

    var presspermitAjaxUI = function (op, handler, item_id) {
        $('#pp_add_role select').prop('disabled', true);
        $('#pp_add_role_waiting').show();

        if (typeof item_id == 'undefined')
            item_id = 0;

        var data = {
            'pp_ajax_agent_roles': op,
            'pp_source_name': 'post',
            'pp_object_type': $('select[name="pp_select_type"]').val(),
            'pp_role_name': $('select[name="pp_select_role"]').val(),
            'pp_item_id': item_id
        };
        $.ajax({url: ppCred.ajaxurl, data: data, dataType: "html", success: handler, error: presspermitAjaxUIFailure});
    }

    var presspermitAjaxUI_done = function () {
        $('#pp_add_role select').prop('disabled', false);
        $('#pp_add_role_waiting').hide();
    }

    var presspermitAjaxUIFailure = function (data, txtStatus) {
        $('#pp_add_role .waiting').hide();
        return;
    }
    // ========== End "Add Roles" UI scripts ==========


    // ========== Begin "Edit Roles" Submission scripts ==========
    // Handle expansion/collapse of sections roles
    $('#pp_current_roles .section-header').on('click', function(e) {
        // Only proceed if the click wasn't on the search box or its children
        if (!$(e.target).closest('.search-box').length) {
            const $section = $(this).closest('.permission-section');
            $section.find('.section-content').slideToggle(200);
            $section.toggleClass('collapsed');
        }
    });
    
    // Handle expansion/collapse of subsections roles
    $('#pp_current_roles .subsection-header').on('click', function(e) {
        // Only proceed if the click wasn't on the search box or its children
        if (!$(e.target).closest('.search-box').length) {
            const $section = $(this).closest('.permission-type');
            $section.find('.subsection-content').slideToggle(200);
            $section.toggleClass('collapsed');
        }
    });

    // Handle row click to toggle checkbox
    $('#pp_current_roles .checkbox-row').on('click', function (e) {
        // Prevent triggering the event if the user clicks directly on the checkbox or an anchor
        if ($(e.target).is('input[type="checkbox"]') || $(e.target).is('a')) {
            return;
        }

        const checkbox = $(this).find('input[type="checkbox"]');
        checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
    });

    // Handle "Select All" checkbox
    $('#pp_current_roles input[id^="cb-select-all-"]').on('change', function () {
        const isChecked = $(this).is(':checked');
        const table = $(this).closest('table');
        
        // Check/uncheck all checkboxes in the table
        table.find(`input[name="pp_edit_role[]"][disabled!="true"]`).prop('checked', isChecked);
        
        // Show or hide the bulk edit section based on the checkbox state
        table.closest('.permission-type').find('.pp-role-bulk-edit').toggle(isChecked);
    });

    // Handle individual checkbox behavior
    $('#pp_current_roles .checkbox-row input[type="checkbox"]').on('change', function () {
        const table = $(this).closest('table');
        const selectAllCheckbox = table.find('thead input[type="checkbox"]');
        const allCheckboxes = table.find('tbody input[type="checkbox"]:not([disabled])');
        const checkedCheckboxes = allCheckboxes.filter(':checked');

        // Update "Select All" checkbox state
        selectAllCheckbox.prop('checked', checkedCheckboxes.length === allCheckboxes.length);

        // Show or hide the bulk edit section based on the checkbox state
        const anyChecked = checkedCheckboxes.length > 0;
        table.closest('.permission-type').find('.pp-role-bulk-edit').toggle(anyChecked);
    });

    $('#pp_current_roles .type-roles-wrapper input').on('click', function (e) {
        //$(this).closest('div.pp-current-roles').find('div.pp-role-bulk-edit').show();
        $('div.pp-role-bulk-edit').show();
    });

    $('#pp_current_roles .checkbox-row .pp_clear').on('click', function (e) {
        e.stopPropagation();
        const roleId = $(this).closest('tr').find('input[type="checkbox"]').val();
        if (roleId) presspermitAjaxSubmit('roles_remove', presspermitRemoveRolesDone, roleId);
    });

    $('#pp_current_roles .pp_check_all').on('click', function (e) {
        $(this).closest('td').find('input[name="pp_edit_role[]"][disabled!="true"]').prop('checked', $(this).is(':checked'));
    });

    var presspermitCurrentRolesAjaxDone = function () {
        $('#pp_current_roles input.submit-edit-item-role').prop('disabled', false);
        $('#pp_current_roles .waiting').hide();
    }

    var presspermitRemoveRolesDone = function (data, txtStatus) {
        presspermitCurrentRolesAjaxDone();

        if (!data)
            return;

        var startpos = data.indexOf('<!--ppResponse-->');
        var endpos = data.indexOf('<--ppResponse-->');

        if ((startpos == -1) || (endpos <= startpos))
            return;

        data = data.substr(startpos + 17, endpos - startpos - 17);

        var deleted_ass_ids = data.split('|');

        $.each(deleted_ass_ids, function (index, value) {
            const row = $(`#pp_current_roles input[name="pp_edit_role[]"][value="${value}"]`).closest('tr');
            if (!row.length){
                cbid = $('#pp_current_roles input[name="pp_edit_role[]"][value="' + value + '"]').attr('id');
                $('#' + cbid).closest('label').remove();
            } else {
                const table = row.closest('table');
                row.remove();
                if (!table.find('tbody tr').length) {
                    table.closest('.pp-current-site-roles').remove();
                }
            }
        });
    }

    $('#pp_current_roles input.submit-edit-item-role').on('click', function (e) {
        //var action = $(this).closest('div.pp-current-roles').find('div.pp-role-bulk-edit select').first().val();
        var action = $('div.pp-role-bulk-edit select').val();

        if (!action) {
            alert(ppCred.noAction);
            return false;
        }

        var selected_ids = new Array();
        //$(this).closest('div.pp-current-roles').find('input[type="checkbox"]:checked').each(function(){
        $('#pp_current_roles').find('input[type="checkbox"]:checked').each(function () {
            selected_ids.push($(this).attr('value'));
        });

        $(this).prop('disabled', true);
        $(this).closest('div').find('.waiting').show();

        switch (action) {
            case 'remove':
                presspermitAjaxSubmit('roles_remove', presspermitRemoveRolesDone, selected_ids.join('|'));
                break
            default:
                break
        }

        return false;
    });

    var presspermitAjaxSubmit = function (op, handler, ass_ids) {
        if (!ass_ids)
            return;

        var data = {
            'pp_ajax_agent_permissions': op,
            'agent_type': ppCred.agentType,
            'agent_id': ppCred.agentID,
            'pp_ass_ids': ass_ids
        };
        $.ajax({
            url: ppCred.ajaxurl,
            data: data,
            dataType: "html",
            success: handler,
            error: presspermitAjaxSubmitFailure
        });
    }

    var presspermitAjaxSubmitFailure = function (data, txtStatus) {
        return;
    }
    // ========== End "Edit Role" Submission scripts ==========
});

