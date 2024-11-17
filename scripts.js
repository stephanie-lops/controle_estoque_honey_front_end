/*
  --------------------------------------------------------------------------------------
  Function to get the existing list from the server via GET request - API (json)
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  let url = 'http://127.0.0.1:5000/produtos';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      // Clear the existing table before inserting new data
      let tableBody = document.getElementById('myTable').getElementsByTagName('tbody')[0];
      tableBody.innerHTML = ''; // Remove all items from the table body

      // Insert new data
      data.produtos.forEach(item => insertList(item.nome, item.size, item.quantity));
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Call the function for initial data loading - API
  --------------------------------------------------------------------------------------
*/
getList();

/*
  --------------------------------------------------------------------------------------
  Function to add an item to the server list via POST request - API (json)
  --------------------------------------------------------------------------------------
*/
const postItem = async (inputProduct, inputSize, inputQuantity) => {
  const formData = new FormData();
  formData.append('nome', inputProduct);
  formData.append('size', inputSize);
  formData.append('quantity', inputQuantity);

  let url = 'http://127.0.0.1:5000/produto';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Function to create a close button for each item in the list
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("Delete");
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);
}

/*
  --------------------------------------------------------------------------------------
  Function to remove an item from the list based on clicking the close button
  --------------------------------------------------------------------------------------
*/
const removeElement = () => {
  let close = document.getElementsByClassName("close");
  for (let i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let row = this.parentElement.parentElement;
      const nomeItem = row.getElementsByTagName('td')[0].innerHTML;
      const sizeItem = row.getElementsByTagName('td')[2].innerHTML; // Capture the size of the item

      if (confirm("Are you sure?")) {
        row.remove();  // Remove the item from the table
        deleteItem(nomeItem, sizeItem);  // Call the deleteItem function passing name and size
        alert("Removed!");
      }
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Edit button
  --------------------------------------------------------------------------------------
*/
const insertEditButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("Edit");
  span.className = "edit";
  span.appendChild(txt);
  parent.appendChild(span);
}

/*
  --------------------------------------------------------------------------------------
  Edit function
  --------------------------------------------------------------------------------------
*/
const updateEditElement = () => {
  let editButtons = document.getElementsByClassName("edit");
  for (let i = 0; i < editButtons.length; i++) {
    editButtons[i].onclick = function () {
      let row = this.parentElement.parentElement;
      const itemName = row.getElementsByTagName('td')[0].textContent;
      const size = row.getElementsByTagName('td')[2].textContent;
      const quantity = row.getElementsByTagName('td')[3].textContent;

      // Open the modal with the current values of the item
      openEditModal(itemName, size, quantity);
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Function to delete an item from the server list via DELETE request - API (json)
  --------------------------------------------------------------------------------------
*/
const deleteItem = (itemName, itemSize) => {
  let url = `http://127.0.0.1:5000/produto?nome=${encodeURIComponent(itemName)}&size=${encodeURIComponent(itemSize)}`;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.mesage === "Product removed") {
        console.log(`Product '${itemName}' of size '${itemSize}' successfully removed.`);
      } else {
        alert(`Error: ${data.mesage}`);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Function to update an item
  --------------------------------------------------------------------------------------
*/
const updateItem = (originalName, originalSize, newName, newSize, newQuantity) => {
  fetch(`http://127.0.0.1:5000/produto`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      originalName: originalName,
      originalSize: originalSize,
      nome: newName,
      size: newSize,
      quantity: newQuantity
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.mesage) { // Check if the response is `mesage`, it may be `message` in the code
      alert(`Error: ${data.mesage}`); // Change to `data.message` if necessary
    } else {
      alert("Item updated successfully!");
      getList(); // Reload the list
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

/*
  --------------------------------------------------------------------------------------
  Function to add a new item with item, size, and quantity 
  --------------------------------------------------------------------------------------
*/
const newItem = () => {
  let inputProduct = document.getElementById("newInput").value;
  let inputSize = document.getElementById("newSize").value;
  let inputQuantity = document.getElementById("newQuantity").value;

  // Check if we are adding or editing
  let originalName = document.getElementById("newInput").getAttribute("data-original-name");
  let originalSize = document.getElementById("newSize").getAttribute("data-original-size");

  if (inputProduct === '') {
    alert("Please enter the name of an item!");
    return; // Exit the function
  } 

  if (!originalName) {
    // Check if the item already exists in the list
    let tableBody = document.getElementById('myTable').getElementsByTagName('tbody')[0];
    for (let row of tableBody.rows) {
      const existingName = row.getElementsByTagName('td')[0].textContent;
      const existingSize = row.getElementsByTagName('td')[2].textContent;
      if (existingName === inputProduct && existingSize === inputSize) {
        alert("Product with the same name and size already exists in the database.");
        return; // Exit the function
      }
    }
  }

  if (originalName) {
    // If an original name exists, we are editing
    updateItem(originalName, originalSize, inputProduct, inputSize, inputQuantity);
  } else {
    // If there is no original name, we are adding a new item
    insertList(inputProduct, inputSize, inputQuantity);
    postItem(inputProduct, inputSize, inputQuantity);
    alert("Item added!");
  }

  // Close the modal
  document.getElementById('itemModal').style.display = 'none';

  // Reload the list
  getList();

  // Reset the form and button
  document.getElementById("itemForm").reset();
  document.querySelector(".addBtn").textContent = "Add";
  document.getElementById("newInput").removeAttribute("data-original-name");
  document.getElementById("newSize").removeAttribute("data-original-size");

  
}


/*
  --------------------------------------------------------------------------------------
  Function to insert items into the displayed list
  --------------------------------------------------------------------------------------
*/
const insertList = (nameProduct, size, quantity) => {
  var item = [nameProduct, size, quantity];
  var table = document.getElementById('myTable').getElementsByTagName('tbody')[0];
  var row = table.insertRow();

  const images = {
    "Button-Detail Shirt": "img/button-detail-shirt.png",
    "Flared Skirt": "img/flared-skirt.png",
    "Cargo Jeans": "img/cargo-jeans.png",
    "Soft Bra": "img/soft-bra.png"
  };

  // Insert columns
  var cellItem = row.insertCell(0);
  var cellImage = row.insertCell(1);
  var cellSize = row.insertCell(2);
  var cellQuantity = row.insertCell(3);
  var cellActions = row.insertCell(4);

  // Insert Item
  cellItem.textContent = nameProduct;

  // Insert image
  const img = document.createElement("img");
  img.src = images[nameProduct];
  img.alt = nameProduct;
  img.width = 100;
  cellImage.appendChild(img);

  cellSize.textContent = size;
  cellQuantity.textContent = quantity;

  // Edit button
  insertEditButton(cellActions);
  // Delete button
  insertButton(cellActions);

  // Update the function to remove elements
  removeElement();
  updateEditElement();
}

/*
  --------------------------------------------------------------------------------------
  Function to open the edit modal
  --------------------------------------------------------------------------------------
*/
const openEditModal = (itemName, size, quantity) => {
  document.getElementById("newInput").value = itemName;
  document.getElementById("newSize").value = size;
  document.getElementById("newQuantity").value = quantity; // Check if this field is being correctly set

  document.querySelector(".addBtn").textContent = "Save";

  document.getElementById("newInput").setAttribute("data-original-name", itemName);
  document.getElementById("newSize").setAttribute("data-original-size", size);

  document.getElementById('itemModal').style.display = 'block';
}

// Function to handle the creation and editing of items in the modal
const handleCreateItem = async (form) => {
  let inputProduct = form.nomeTitle.value;
  let inputSize = form.itemSize.value;
  let inputQuantity = form.itemQuantity.value;

  if (inputProduct === '') {
    alert("Please enter the name of an item!");
  } else {
    if (document.querySelector(".addBtn").textContent === "Save") {
      const originalName = document.getElementById("newInput").getAttribute("data-original-name");
      const originalSize = document.getElementById("newSize").getAttribute("data-original-size");
      updateItem(originalName, originalSize, inputProduct, inputSize, inputQuantity);
    } else {
      insertList(inputProduct, inputSize, inputQuantity);
      postItem(inputProduct, inputSize, inputQuantity);
      alert("Item added!");
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  MODAL
  --------------------------------------------------------------------------------------
*/
document.addEventListener("DOMContentLoaded", function () {
  var modalCreateItem = document.getElementById('itemModal');
  var btnCreateItem = document.getElementById('createItemBtn');
  var btnModalItemCreateCancel = document.getElementById('btnModalItemCreateCancel');

  // Open the modal box to create an item when clicking the button
  btnCreateItem.onclick = function () {
    modalCreateItem.style.display = 'block';
  }
  btnModalItemCreateCancel.onclick = function () {
    modalCreateItem.style.display = 'none';
  }

  // Close the modal when clicking outside of it
  window.onclick = function (event) {
    if (event.target == modalCreateItem) {
      modalCreateItem.style.display = 'none';
    }
  }

  // Action on form submission
  var form = document.getElementById('itemForm');
  form.onsubmit = function (event) {
    event.preventDefault();
    handleCreateItem(form);
    // Close the modal box after processing the data
    modalCreateItem.style.display = 'none';
    this.reset();
  }
});
