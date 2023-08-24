let isRelatedField;
let targetField;
let listItems = [];
let targetCellId;
let nextTargetCellId;
const columnHeaders = {
    0: "Product",
    1: "Type",
    2: "Target Observable Type",
    3: "Name",
    4: "Strong",
    5: "Weak",
    6: "Target Extra Prop",
    7: "Extra Prop",
    8: "Target Related Extra Prop",
    9: "Related Extra Prop",
};
// JavaScript function to clear the inputs in the "Add New Record" modal
function clearAddRecordInputs() {
    document.getElementById('productInput').value = '';
    document.getElementById('targetObservableTypeInput').value = '';
    document.getElementById('strongInput').value = '';
    document.getElementById('targetExtraPropInput').value = '';
    document.getElementById('targetRelatedExtraPropInput').value = '';
    document.getElementById('typeInput').value = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('weakInput').value = '';
    document.getElementById('extraPropInput').value = '';
    document.getElementById('relatedExtraPropInput').value = '';
}

// Function to open ListFieldModal
function openListFieldModal(input, field) {
    const containerId = 'newListItems';
    const value = input.value.trim();
    const items = parseListItems(value);
    populateList(containerId, items, field, input.value);

    $('#newListFieldModalLabel').text(field);

    // Store the calling input ID in a data attribute of the "Done" button
    const doneButton = document.getElementById('newListFieldDoneButton');
    doneButton.dataset.callingInputId = input.id;

    $('#newListFieldModal').modal('show');
}

function newSaveListField() {
    const container = document.getElementById('newListItems');
    const items = container.getElementsByClassName('form-control');
    const values = [];
    for (let i = 0; i < items.length; i++) {
        const value = items[i].value.trim();
        if (value !== '') {
            values.push(value);
        }
    }

    let errorMessageElement = document.getElementById('newListFieldErrorMessage');
    if (values.length === 0) {
        const errorMessage = `Empty values cannot be saved. Please fill them.`;
        errorMessageElement.textContent = errorMessage;
        errorMessageElement.style.display = 'block';
        return;
    } else {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }
    const invalidValues = [];
    for (const item of values) {
        if (!validateRegex(item)) {
            invalidValues.push(item);
        }
    }
    if (invalidValues.length > 0) {
        const errorMessage = `Invalid regex pattern found in List Field: ${invalidValues.join(', ')}`;
        errorMessageElement.textContent = errorMessage;
        errorMessageElement.style.display = 'block';
        return;
    } else {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }
    let dup_values = [];
    let check_values = [];
    let isDuplicate = false;

    for (let i = 0; i < items.length; i++) {
        const value = items[i].value.trim();
        // Trim the value to remove leading and trailing spaces
        if (value !== '') {
            if (check_values.includes(value)) {
                isDuplicate = true;
                dup_values.push(value);
            } else {
                check_values.push(value);
            }
        }
    }

    if (isDuplicate) {
        errorMessageElement.textContent = `Duplicate values are not allowed: ${dup_values.join(', ')}`;
        errorMessageElement.style.display = 'block';
        return; // Abort saving process if duplicates are found
    } else {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }

    const newValue = joinListItems(values);

    // Get the calling input ID from the dataset
    const doneButton = document.getElementById('newListFieldDoneButton');
    const callingInputId = doneButton.dataset.callingInputId;

    // Set the new value to the calling input textbox
    document.getElementById(callingInputId).value = newValue;

    // Close the newListFieldModal
    $('#newListFieldModal').modal('hide');
}

// Function to open TwoFieldModal
function openTwoFieldModal(input, target, extra) {
    if (target === 'Target Extra Prop') {
        isRelatedField = false;
        target_value = document.getElementById('targetExtraPropInput').value;
        extra_value = document.getElementById('extraPropInput').value;
    } else {
        isRelatedField = true;
        target_value = document.getElementById('targetRelatedExtraPropInput').value;
        extra_value = document.getElementById('relatedExtraPropInput').value;
    }
    $('#newTargetColumnHeader').text(target);
    $('#newValueColumnHeader').text(extra);
    populateTwoFieldsModal('newTwoFieldsContainer', target_value, extra_value);
    $('#newTwoFieldModal').modal('show');
}

function newSaveTwoFields() {
    console.log("Calling saveTwoFields function");
    const container = document.getElementById('newTwoFieldsContainer');
    const items = container.getElementsByClassName('input-group');
    const errorMessageElement = document.getElementById('newTwoFieldErrorMessage');
    let targetValue = [];
    let extraValue = [];
    let textbox = [];
    let value = '';
    let allEmpty = true;
    let allHaveValue = true;
    for (let i = 0; i < items.length; i++) {
        textbox = items[i].getElementsByClassName('form-control');
        value = textbox[0].value.trim();
        if (value !== '') {
            targetValue.push(value);
            allEmpty = false;
        } else {
            allHaveValue = false;
        }
        value = textbox[1].value.trim();
        if (value !== '') {
            extraValue.push(value);
        }
        if (value === '') {
            errorMessageElement.textContent = "Empty fields are not allowed in the 2nd column";
            errorMessageElement.style.display = 'block';
            return;
        }
    }
    if (!allEmpty && !allHaveValue) {
        errorMessageElement.textContent = `Target fields either should all be empty or have a value`;
        errorMessageElement.style.display = 'block';
        return;
    }
    const invalidExtraValues = [];
    for (const item of extraValue) {
        if (!validateRegex(item)) {
            invalidExtraValues.push(item);
        }
    }
    if (invalidExtraValues.length > 0) {
        const errorMessage = `Invalid regex pattern found in Extra Prop: ${invalidExtraValues.join(', ')}`;
        errorMessageElement.textContent = errorMessage;
        errorMessageElement.style.display = 'block';
        return;
    } else {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }

    if (isRelatedField) {
        document.getElementById("targetRelatedExtraPropInput").value = joinListItems(targetValue);
        document.getElementById("relatedExtraPropInput").value = joinListItems(extraValue);
    } else {
        document.getElementById("targetExtraPropInput").value = joinListItems(targetValue);
        document.getElementById("extraPropInput").value = joinListItems(extraValue);
    }
    $('#newTwoFieldModal').modal('hide');
}

// Function to save new record
function saveNewRecord() {
    console.log(`Calling saveNewRecord function`);
    const record = {
        product: document.getElementById('productInput').value.trim(),
        type: document.getElementById('typeInput').value.trim(),
        target_observable_type: document.getElementById('targetObservableTypeInput').value.trim(),
        name: document.getElementById('nameInput').value.trim(),
        strong: `[${parseListItems(document.getElementById('strongInput').value.trim()).join(', ')}]`,
        weak: `[${parseListItems(document.getElementById('weakInput').value.trim()).join(', ')}]`,
        target_extra_prop: `[${parseListItems(document.getElementById('targetExtraPropInput').value.trim()).join(', ')}]`,
        extra_prop: `[${parseListItems(document.getElementById('extraPropInput').value.trim()).join(', ')}]`,
        target_related_extra_prop: `[${parseListItems(document.getElementById('targetRelatedExtraPropInput').value.trim()).join(', ')}]`,
        related_extra_prop: `[${parseListItems(document.getElementById('relatedExtraPropInput').value.trim()).join(', ')}]`,
    };

    // Call the endpoint to save the new record
    const url = '/editor/save_new_record/';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(record),
    }).then(response => response.json()).then(data => {
        console.log('Save New Record API response:', data);
        console.log('Save New Record API response:', record);

        // Optionally, update the data table with the new record without having to refresh the page
        $('#dataTable').DataTable().row.add([
            record.product,
            record.type,
            record.target_observable_type,
            record.name,
            record.strong,
            record.weak,
            record.target_extra_prop,
            record.extra_prop,
            record.target_related_extra_prop,
            record.related_extra_prop,
            ""
        ]).draw(false);
        const row = document.evaluate('//*[@id="dataTable"]/tbody/tr[not(@id)]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        row.id = `row-${data.record.id}`;
        xpath = `//*[@id="dataTable"]/tbody/tr[@id="row-${data.record.id}"]/td`
        const newRow = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
        let node;
        const nodes = [];
        while (node = newRow.iterateNext()) {
          nodes.push(node);
        }
        setNewRecordAttr(nodes, data.record)
        $('#addRecordModal').modal('hide');
    }).catch(error => {
        console.error('Error saving new record:', error);
    });
    clearAddRecordInputs();
}

function setNewRecordAttr(nodes, record) {
    nodes[0].onclick = function() {
        editCell(this, 'product', record.id);
    };
    nodes[0].id = `row-${record.id}-product`;
    nodes[0].class = 'editable sorting_1'

    nodes[1].onclick = function() {
        editCell(this, 'type', record.id);
    };
    nodes[1].id = `row-${record.id}-type`;
    nodes[1].class = 'editable'

    nodes[2].onclick = function() {
        editCell(this, 'target_observable_type', record.id);
    };
    nodes[2].id = `row-${record.id}-target_observable_type`;
    nodes[2].class = 'editable'

    nodes[3].onclick = function() {
        editCell(this, 'name', record.id);
    };
    nodes[3].id = `row-${record.id}-name`;
    nodes[3].class = 'editable'
    nodes[4].onclick = function() {
        editCell(this, 'strong', record.id);
    };
    nodes[4].id = `row-${record.id}-strong`;
    nodes[4].class = 'editable'
    nodes[5].onclick = function() {
        editCell(this, 'weak', record.id);
    };
    nodes[5].id = `row-${record.id}-weak`;
    nodes[5].class = 'editable'

    nodes[6].onclick = function() {
        editTwoFields(this, record.id);
    };
    if (record.target_extra_prop.includes(',')) {
        nodes[6].setAttribute('data-target-extra-prop', record.target_extra_prop.replace("[", "['").replace("]", "']").replace(", ", "','"));
    } else {
        nodes[6].setAttribute('data-target-extra-prop', record.target_extra_prop);
    }
    if (record.extra_prop.includes(',')) {
        nodes[6].setAttribute('data-extra-prop', record.extra_prop.replace("[", "['").replace("]", "']").replace(",", "','"));
    } else {
        nodes[6].setAttribute('data-extra-prop', record.extra_prop);
    }
    nodes[6].id = `row-${record.id}-target_extra_prop`;
    nodes[6].class = 'editable'

    nodes[7].onclick = function() {
        editTwoFields(this, record.id);
    };
    if (record.target_extra_prop.includes(',')) {
        nodes[7].setAttribute('data-target-extra-prop', record.target_extra_prop.replace("[", "['").replace("]", "']").replace(", ", "','"));
    } else {
        nodes[7].setAttribute('data-target-extra-prop', record.target_extra_prop);
    }
    if (record.extra_prop.includes(',')) {
        nodes[7].setAttribute('data-extra-prop', record.extra_prop.replace("[", "['").replace("]", "']").replace(",", "','"));
    } else {
        nodes[7].setAttribute('data-extra-prop', record.extra_prop);
    }
    nodes[7].id = `row-${record.id}-extra_prop`;
    nodes[7].class = 'editable'

    nodes[8].onclick = function() {
        editTwoRelatedFields(this, record.id);
    };
    if (record.target_related_extra_prop.includes(',')) {
        nodes[8].setAttribute('data-target-related-extra-prop', record.target_related_extra_prop.replace("[", "['").replace("]", "']").replace(", ", "','"));
    } else {
        nodes[8].setAttribute('data-target-related-extra-prop', record.target_related_extra_prop);
    }
    if (record.related_extra_prop.includes(',')) {
        nodes[8].setAttribute('data-related-extra-prop', record.related_extra_prop.replace("[", "['").replace("]", "']").replace(",", "','"));
    } else {
        nodes[8].setAttribute('data-related-extra-prop', record.related_extra_prop);
    }
    nodes[8].id = `row-${record.id}-target_related_extra_prop`;
    nodes[8].class = 'editable'

    nodes[9].onclick = function() {
        editTwoRelatedFields(this, record.id);
    };
    if (record.target_related_extra_prop.includes(',')) {
        nodes[9].setAttribute('data-target-related-extra-prop', record.target_related_extra_prop.replace("[", "['").replace("]", "']").replace(", ", "','"));
    } else {
        nodes[9].setAttribute('data-target-related-extra-prop', record.target_related_extra_prop);
    }
    if (record.related_extra_prop.includes(',')) {
        nodes[9].setAttribute('data-related-extra-prop', record.related_extra_prop.replace("[", "['").replace("]", "']").replace(",", "','"));
    } else {
        nodes[9].setAttribute('data-related-extra-prop', record.related_extra_prop);
    }
    nodes[9].id = `row-${record.id}-related_extra_prop`;
    nodes[9].class = 'editable'
    nodes[10].innerHTML=`
            <div class="button-group">
              <button class="btn btn-danger" onclick="openDeleteConfirmationModal(${record.id})"  title="Delete">
                <i class="fas fa-trash"></i>
              </button>
              <button class="btn btn-primary" onclick="openDuplicateModal(${record.id})"  title="Duplicate">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            `;
}
function editCell(cell, field, id) {
    console.log(`Calling editCell function with cell:`, cell, `field:`, field, `and id:`, id);
    targetField = field;
    targetCellId = `row-${id}-${field}`;
    const oldValue = cell.innerText;
    listItems = [];

    // Parse list items for list fields only
    if (targetField === 'strong' || targetField === 'weak') {
        console.log(`Parsing list items for field:`, targetField, `with oldValue:`, oldValue);
        listItems = parseListItems(oldValue);
    }

    populateList('listItems', listItems, targetField, oldValue);

    // Get the corresponding column name for the label
    let columnName = getColumnName(cell.cellIndex);
    console.log(`Column header for cellIndex ${cell.cellIndex}:`, columnName);

    if (targetField === 'strong' || targetField === 'weak') {
        $('#listFieldModalLabel').text(columnName);
        $('#listFieldModal').modal('show');
    } else {
        $('#stringFieldModalLabel').text(columnName);
        $('#stringFieldValue').val(oldValue);
        $('#stringFieldModal').modal('show');
    }
}

// Return the header text from the mapping or an empty string if not found
function getColumnName(cellIndex) {
    return columnHeaders[cellIndex] || "";
}

function parseListItems(value) {
    console.log(`Calling parseListItems function with value:`, value);
    // Remove leading and trailing brackets [ ]
    value = value.trim().slice(1, -1);

    // Split by comma and remove leading and trailing spaces and quotes
    const items = value.split(',').map(item => item.trim().replace(/^['"]|['"]$/g, ''));

    return items;
}

function joinListItems(items) {
    console.log(`Calling joinListItems function with items:`, items);
    // Join items with comma and space
    const value = items.join("', '");

    // Add leading and trailing brackets [ ]
    return `['${value}']`;
}

function populateList(containerId, items, field, value) {
    console.log(containerId, items, field, value);
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // If field is of string type, display a single input without "Add" button
    if (field === 'product' || field === 'type' || field === 'name' || field === 'target_observable_type') {
        const listItem = document.createElement('div');
        listItem.className = 'form-group';
        listItem.innerHTML = `
            <input type="text" class="form-control" value="${value}">
          `;
        container.appendChild(listItem);
    } else {
        // For list types, display inputs with "Add" button
        for (let i = 0; i < items.length; i++) {
            const listItem = document.createElement('div');
            listItem.className = 'form-group';
            if (targetField === 'strong' || targetField === 'weak' || field === 'Strong' || field === 'Weak') {
                listItem.innerHTML = `
                <div class="input-group">
                  <input type="text" class="form-control" value="${items[i]}">
                  <div class="input-group-append">
                    <button class="btn btn-danger btn-sm" onclick="removeItem(this)"><i class="fas fa-minus"></i></button>
                  </div>
                </div>
              `;
            } else {
                listItem.innerHTML = `
                <input type="text" class="form-control" value="${items[i]}">
              `;
            }
            container.appendChild(listItem);
        }
        // Show the "Add" button only for list types
        const addButton = document.getElementById('addButton');
        addButton.style.display = (targetField === 'strong' || targetField === 'weak') ? 'block' : 'none';
    }
}

function addItem(containerId) {
    console.log(`Calling addItem function with containerId:`, containerId);
    const container = document.getElementById(containerId);
    const listItem = document.createElement('div');
    listItem.className = 'form-group';
    listItem.innerHTML = `
          <div class="input-group">
            <input type="text" class="form-control" value="">
            <div class="input-group-append">
              <button class="btn btn-danger btn-sm" onclick="removeItem(this)"><i class="fas fa-minus"></i></button>
            </div>
          </div>
        `;
    container.appendChild(listItem);
}

function removeItem(button) {
    console.log(`Calling removeItem function`);
    const listItem = button.parentNode.parentNode;
    listItem.parentNode.removeChild(listItem);
}

function removeItems(containerId) {
    console.log(`Calling removeItems function with containerId:`, containerId);
    const container = document.getElementById(containerId);
    const items = container.getElementsByClassName('list-item');
    removeListItems(items);
}

function removeListItems(items) {
    console.log(`Calling removeListItems function`);
    for (let i = items.length - 1; i >= 0; i--) {
        items[i].parentNode.removeChild(items[i]);
    }
}

function saveStringField() {
    console.log(`Calling saveStringField function`);
    const cell = document.getElementById(targetCellId);
    // Use the stored cell ID
    const newValue = document.getElementById('stringFieldValue').value;
    cell.innerText = newValue;
    $('#stringFieldModal').modal('hide');

    // Call the endpoint to update the column
    const url = '/editor/update_column/';
    const data = {
        id: parseInt(targetCellId.split('-')[1]),
        // Extract the record ID from the cell ID (e.g., 1 from row-1-product)
        field: targetCellId.split('-')[2],
        // Extract the field name from the cell ID (e.g., product from row-1-product)
        newValue: newValue,
    };
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
            // Don't forget to add the CSRF token
        },
        body: JSON.stringify(data),
    }).then(response => response.json()).then(data => {
        console.log('Update Column API response:', data);
    }).catch(error => {
        console.error('Error updating column:', error);
    });
}

function getCookie(name) {
    const value = document.cookie;
    console.log('Cookie:', value);
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
        return parts.pop().split(';').shift();
}

function saveListField() {
    console.log(`Calling saveListField function`);
    const cell = document.getElementById(targetCellId);
    // Use the stored cell ID
    const container = document.getElementById('listItems');
    const items = container.getElementsByClassName('form-control');
    const values = [];
    for (let i = 0; i < items.length; i++) {
        const value = items[i].value.trim();
        // Trim the value to remove leading and trailing spaces
        if (value !== '') {
            // Only add non-empty values to the array
            values.push(value);
        }
    }
    let errorMessageElement = document.getElementById('listFieldErrorMessage');
    if (values.length === 0) {
        const errorMessage = `Empty values cannot be saved. Please fill them.`;
        errorMessageElement.textContent = errorMessage;
        errorMessageElement.style.display = 'block';
        return;
    } else {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }
    const invalidValues = [];
    for (const item of values) {
        if (!validateRegex(item)) {
            invalidValues.push(item);
        }
    }
    if (invalidValues.length > 0) {
        const errorMessage = `Invalid regex pattern found in List Field: ${invalidValues.join(', ')}`;
        errorMessageElement.textContent = errorMessage;
        errorMessageElement.style.display = 'block';
        return;
    } else {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }
    let dup_values = [];
    let check_values = [];
    let isDuplicate = false;

    for (let i = 0; i < items.length; i++) {
        const value = items[i].value.trim();
        // Trim the value to remove leading and trailing spaces
        if (value !== '') {
            if (check_values.includes(value)) {
                isDuplicate = true;
                dup_values.push(value);
            } else {
                check_values.push(value);
            }
        }
    }

    if (isDuplicate) {
        errorMessageElement.textContent = `Duplicate values are not allowed: ${dup_values.join(', ')}`;
        errorMessageElement.style.display = 'block';
        return; // Abort saving process if duplicates are found
    } else {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }

    const newValue = joinListItems(values);
    cell.innerText = newValue;
    $('#listFieldModal').modal('hide');

    // Call the endpoint to update the column
    const url = '/editor/update_column/';
    const data = {
        id: parseInt(targetCellId.split('-')[1]),
        // Extract the record ID from the cell ID (e.g., 1 from row-1-product)
        field: targetCellId.split('-')[2],
        // Extract the field name from the cell ID (e.g., product from row-1-product)
        newValue: newValue,
    };
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
            // Don't forget to add the CSRF token
        },
        body: JSON.stringify(data),
    }).then(response => response.json()).then(data => {
        console.log('Update Column API response:', data);
    }).catch(error => {
        console.error('Error updating column:', error);
    });
}

$(document).ready(function() {
    // Initialize DataTables
    const dataTable = $('#dataTable').DataTable({
        // Define the columns and their initial sorting order (e.g., ascending or descending)
        columnDefs: [{
                targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                orderable: true
            }, {
                targets: '_all',
                orderable: false
            }, {
                targets: -1, // Target last column
                orderable: false,
                searchable: false
            }
        ],
        // Enable filtering
        searching: true,
        initComplete: function() {
            // Add filtering options for Product and Type columns
            this.api().columns([0, 1]).every(function() {
                const column = this;
                const select = $('<select><option value=""></option></select>').appendTo($(column.header())).on('click', function(e) {
                    e.stopPropagation();
                    // Prevent DataTables' default sorting behavior
                }).on('change', function() {
                    const val = $.fn.dataTable.util.escapeRegex($(this).val());

                    column.search(val ? '^' + val + '$' : '', true, false).draw();
                });

                column.data().unique().sort().each(function(d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>');
                });
            });
        },
    });

    // Dark mode switch toggle
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    darkModeSwitch.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', darkModeSwitch.checked);

        // Apply dark mode class to modals
        const modals = document.querySelectorAll('.modal-content');
        for (const modal of modals) {
            modal.classList.toggle('dark-mode', darkModeSwitch.checked);
        }
    });
});
// Function for "target_extra_prop" and "extra_prop" group
function editTwoFields(cell, id) {
    targetCellId = `row-${id}-target_extra_prop`;
    nextTargetCellId = `row-${id}-extra_prop`;
    const targetExtraProp = cell.dataset.targetExtraProp;
    const extraProp = cell.dataset.extraProp;

    // Get the corresponding column name for the label of target_extra_prop
    let targetColumnName = getColumnName(cell.cellIndex);
    let valueColumnName;

    // Handle the case when clicking on "target_extra_prop" field
    if (targetColumnName === "Target Extra Prop") {
        valueColumnName = getColumnName(cell.cellIndex + 1);
    } // Handle the case when clicking on "extra_prop" field
    else if (targetColumnName === "Extra Prop") {
        valueColumnName = targetColumnName;
        targetColumnName = getColumnName(cell.cellIndex - 1);
    }

    // Populate the "twoFieldModal" with the data for target_extra_prop and extra_prop
    populateTwoFieldsModal('twoFieldsContainer', targetExtraProp, extraProp);

    $('#twoFieldModal').modal('show');
    // Set the column names on top of the two text input columns
    document.getElementById('targetColumnHeader').textContent = targetColumnName;
    document.getElementById('valueColumnHeader').textContent = valueColumnName;
}

// Function for "related_extra_prop" and "target_related_extra_prop" group
function editTwoRelatedFields(cell, id) {
    targetCellId = `row-${id}-target_related_extra_prop`;
    nextTargetCellId = `row-${id}-related_extra_prop`;
    const targetRelatedExtraProp = cell.dataset.targetRelatedExtraProp;
    const relatedExtraProp = cell.dataset.relatedExtraProp;

    // Get the corresponding column name for the label of target_related_extra_prop
    let targetRelatedColumnName = getColumnName(cell.cellIndex);
    let relatedValueColumnName;

    // Handle the case when clicking on "target_related_extra_prop" field
    if (targetRelatedColumnName === "Target Related Extra Prop") {
        relatedValueColumnName = getColumnName(cell.cellIndex + 1);
    } // Handle the case when clicking on "related_extra_prop" field
    else if (targetRelatedColumnName === "Related Extra Prop") {
        relatedValueColumnName = targetRelatedColumnName;
        targetRelatedColumnName = getColumnName(cell.cellIndex - 1);
    }

    // Populate the "twoFieldModal" with the data for target_related_extra_prop and related_extra_prop
    populateTwoFieldsModal('twoFieldsContainer', targetRelatedExtraProp, relatedExtraProp);

    $('#twoFieldModal').modal('show');

    // Set the column names on top of the two text input columns
    document.getElementById('targetColumnHeader').textContent = targetRelatedColumnName;
    document.getElementById('valueColumnHeader').textContent = relatedValueColumnName;
}

function populateTwoFieldsModal(containerId, targetValue, value) {
    const container = document.getElementById(containerId);

    container.innerHTML = '';
    // Clear the container first before populating new elements

    const targetItems = parseListItems(targetValue);
    const items = parseListItems(value);

    for (let i = 0; i < Math.max(targetItems.length, items.length); i++) {
        const listItem = document.createElement('div');
        listItem.className = 'form-group';

        const targetItemValue = targetItems[i] || '';
        const itemValue = items[i] || '';

        listItem.innerHTML = `
        <div class="input-group">
          <input type="text" class="form-control" value="${targetItemValue}">
          <input type="text" class="form-control" value="${itemValue}">
          <div class="input-group-append">
            <button class="btn btn-danger btn-sm" onclick="removeTwoFields(this)"><i class="fas fa-minus"></i></button>
          </div>
        </div>
      `;

        container.appendChild(listItem);
    }
}

function addTwoFields(container) {
    container = document.getElementById(container);
    const listItem = document.createElement('div');
    listItem.className = 'form-group';
    listItem.innerHTML = `
        <div class="input-group">
          <input type="text" class="form-control" value="">
          <input type="text" class="form-control" value="">
          <div class="input-group-append">
            <button class="btn btn-danger btn-sm" onclick="removeTwoFields(this)"><i class="fas fa-minus"></i></button>
          </div>
        </div>
      `;
    container.appendChild(listItem);
}


function removeTwoFields(button) {
    const listItem = button.closest('.form-group');
    listItem.remove();
}
// Function for saving both groups
async function saveTwoFields() {
    console.log(`Calling saveTwoFields function`);
    console.log(`Calling saveTwoFields function`);
    const cell = document.getElementById(targetCellId);
    const nextCell = document.getElementById(nextTargetCellId);
    // Use the stored cell ID
    const container = document.getElementById('twoFieldsContainer');
    const items = container.getElementsByClassName('input-group');
    const errorMessageElement = document.getElementById('twoFieldErrorMessage');
    const values = [];
    let targetValue = [];
    let extraValue = [];
    let textbox = [];
    let value = '';
    let allEmpty = true;
    let allHaveValue = true;
    for (let i = 0; i < items.length; i++) {
        textbox = items[i].getElementsByClassName('form-control');
        value = textbox[0].value.trim();
        if (value !== '') {
            targetValue.push(value);
            allEmpty = false;
        } else {
            allHaveValue = false;
        }
        value = textbox[1].value.trim();
        if (value !== '') {
            extraValue.push(value);
        }
        if (value === '') {
            errorMessageElement.textContent = "Empty fields are not allowed in the 2nd column";
            errorMessageElement.style.display = 'block';
            return;
        }
    }
    if (!allEmpty && !allHaveValue) {
        errorMessageElement.textContent = "Target fields either should all be empty or have a value";
        errorMessageElement.style.display = 'block';
        return;
    }
    const invalidExtraValues = [];
    for (const item of extraValue) {
        if (!validateRegex(item)) {
            invalidExtraValues.push(item);
        }
    }
    if (invalidExtraValues.length > 0) {
        const errorMessage = "Invalid regex pattern found in Extra Prop: ${invalidExtraValues.join(', ')}";
        errorMessageElement.textContent = errorMessage;
        errorMessageElement.style.display = 'block';
        return;
    } else {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }

    const isRelatedField = targetCellId.includes("related");
    const newTargetValue = joinListItems(targetValue);
    if (isRelatedField) {
        cell.dataset.targetRelatedExtraProp = newTargetValue; // Set data-target-related-extra-prop for related fields
        nextCell.dataset.targetRelatedExtraProp = newTargetValue;
    } else {
        cell.dataset.targetExtraProp = newTargetValue; // Set data-target-extra-prop for non-related fields
        nextCell.dataset.targetExtraProp = newTargetValue; // Set data-target-extra-prop for non-related fields
    }
    cell.innerText = newTargetValue;
    const newExtraValue = joinListItems(extraValue);
    if (isRelatedField) {
        cell.dataset.relatedExtraProp = newExtraValue; // Set data-related-extra-prop for related fields
        nextCell.dataset.relatedExtraProp = newExtraValue; // Set data-related-extra-prop for related fields
    } else {
        cell.dataset.extraProp = newExtraValue; // Set data-extra-prop for non-related fields
        nextCell.dataset.extraProp = newExtraValue; // Set data-extra-prop for non-related fields
    }
    nextCell.innerText = newExtraValue;
    $('#twoFieldModal').modal('hide');

    // Call the endpoint to update the column
    const url = '/editor/update_column/';

    try {
        const target_data = {
            id: parseInt(targetCellId.split('-')[1]),
            field: targetCellId.split('-')[2],
            newValue: newTargetValue,
        };
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(target_data),
        });
        console.log('Update Column API response:', target_data);
    } catch (error) {
        console.error('Error updating column:', error);
    }

    try {
        const extra_data = {
            id: parseInt(nextTargetCellId.split('-')[1]),
            field: nextTargetCellId.split('-')[2],
            newValue: newExtraValue,
        };
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(extra_data),
        });
        console.log('Update Column API response:', extra_data);
    } catch (error) {
        console.error('Error updating column:', error);
    }
}

function validateRegex(pattern) {
    try {
        RegExp(pattern);
        return true;
    } catch (error) {
        return false;
    }
}

function openDeleteConfirmationModal(id) {
  $('#deleteConfirmationModal').modal('show');
  // Store the ID of the record to be deleted in a hidden input field
  $('#deleteRecordId').val(id);
}

// Function to delete the record
function deleteRecord(){
 var recordId = $('#deleteRecordId').val();
  fetch('/editor/delete_record/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ record_id: recordId }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Remove the row from the table
      const row = document.getElementById(`row-${recordId}`);
      row.remove();
      $('#deleteConfirmationModal').modal('hide');
    } else {
      alert('Failed to delete the record.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// Function to open duplicate modal and prefill with record values
function openDuplicateModal(recordId) {
  const record = getRecordById(recordId); // Implement this function to retrieve the record by ID
  if (record) {
    // Prefill modal fields
    document.getElementById('productInput').value = record.product;
    document.getElementById('typeInput').value = record.type;
    document.getElementById('targetObservableTypeInput').value = record.targetObservableType;
    document.getElementById('nameInput').value = record.name;
    document.getElementById('strongInput').value = record.strong;
    document.getElementById('weakInput').value = record.weak;
    document.getElementById('targetExtraPropInput').value = record.targetExtraProp;
    document.getElementById('extraPropInput').value = record.extraProp;
    document.getElementById('targetRelatedExtraPropInput').value = record.targetRelatedExtraProp;
    document.getElementById('relatedExtraPropInput').value = record.relatedExtraProp;

    // Open the modal
    $('#addRecordModal').modal('show');
  }
}

function getRecordById(recordId) {
  const record = {};

  const row = document.getElementById(`row-${recordId}`);
  if (!row) {
    console.error(`Row with ID 'row-${recordId}' not found.`);
    return record;
  }

  record.product = row.querySelector(`#row-${recordId}-product`).textContent;
  record.type = row.querySelector(`#row-${recordId}-type`).textContent;
  record.targetObservableType = row.querySelector(`#row-${recordId}-target_observable_type`).textContent;
  record.name = row.querySelector(`#row-${recordId}-name`).textContent;
  record.strong = row.querySelector(`#row-${recordId}-strong`).textContent;
  record.weak = row.querySelector(`#row-${recordId}-weak`).textContent;
  record.targetExtraProp = row.querySelector(`#row-${recordId}-target_extra_prop`).textContent;
  record.extraProp = row.querySelector(`#row-${recordId}-extra_prop`).textContent;
  record.targetRelatedExtraProp = row.querySelector(`#row-${recordId}-target_related_extra_prop`).textContent;
  record.relatedExtraProp = row.querySelector(`#row-${recordId}-related_extra_prop`).textContent;

  return record;
}