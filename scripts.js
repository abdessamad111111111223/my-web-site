document.addEventListener("DOMContentLoaded", () => {
    const addPlaceBtn = document.getElementById("addPlaceBtn");
    const addPlaceModal = document.getElementById("addPlaceModal");
    const cancelBtn = document.getElementById("cancelBtn");
    const addPlaceForm = document.getElementById("addPlaceForm");
    const placesContainer = document.getElementById("placesContainer");

    const currentUser = "admin"; // معرف المستخدم الحالي (استبدله وفق نظام تسجيل الدخول الخاص بك)

    // Load places from localStorage
    const loadPlaces = () => {
        const places = JSON.parse(localStorage.getItem("places")) || [];
        if (places.length === 0) {
            placesContainer.innerHTML = "<p>No places added yet.</p>";
        } else {
            placesContainer.innerHTML = "";
            places.forEach(renderPlace);
        }
    };

    // Save places to localStorage
    const savePlace = (place) => {
        const places = JSON.parse(localStorage.getItem("places")) || [];
        places.push(place);
        localStorage.setItem("places", JSON.stringify(places));
    };

    const deletePlace = (placeId) => {
        const places = JSON.parse(localStorage.getItem("places")) || [];
        const updatedPlaces = places.filter((place) => place.id !== placeId);
        localStorage.setItem("places", JSON.stringify(updatedPlaces));
        loadPlaces();
    };

    const updatePlace = (updatedPlace) => {
        const places = JSON.parse(localStorage.getItem("places")) || [];
        const index = places.findIndex((place) => place.id === updatedPlace.id);
        if (index !== -1) {
            places[index] = updatedPlace;
            localStorage.setItem("places", JSON.stringify(places));
        }
    };

    const toggleModal = () => {
        addPlaceModal.classList.toggle("hidden");
    };

    const renderPlace = (place) => {
        const placeCard = document.createElement("div");
        placeCard.className = "place-card";
        placeCard.innerHTML = `
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <p><strong>Alert:</strong> ${place.alert}</p>
            ${place.link ? `<a href="${place.link}" target="_blank" class="visit-btn">Visit Place</a>` : ""}
            <div class="images">
                ${place.images.map((src) => `<img src="${src}" alt="${place.name}">`).join("")}
            </div>
            ${
                place.owner === currentUser
                    ? `<button class="edit-btn" data-id="${place.id}">Edit</button>
                       <button class="delete-btn" data-id="${place.id}">Delete</button>`
                    : ""
            }
        `;
        placesContainer.appendChild(placeCard);

        // Add event listeners for edit and delete buttons
        if (place.owner === currentUser) {
            placeCard.querySelector(".edit-btn").addEventListener("click", () => {
                editPlace(place);
            });

            placeCard.querySelector(".delete-btn").addEventListener("click", () => {
                const confirmDelete = confirm(`Are you sure you want to delete "${place.name}"?`);
                if (confirmDelete) {
                    deletePlace(place.id);
                }
            });
        }
    };

    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    };

    const editPlace = (place) => {
        // Prefill form with current data
        document.getElementById("placeName").value = place.name;
        document.getElementById("placeDescription").value = place.description;
        document.getElementById("placeAlert").value = place.alert;
        document.getElementById("placeLink").value = place.link;

        toggleModal();

        addPlaceForm.onsubmit = async (event) => {
            event.preventDefault();

            const updatedPlace = {
                ...place,
                name: document.getElementById("placeName").value,
                description: document.getElementById("placeDescription").value,
                alert: document.getElementById("placeAlert").value || "No alerts.",
                link: document.getElementById("placeLink").value,
                images: await Promise.all(
                    Array.from(document.getElementById("placeImages").files).map(readFileAsDataURL)
                ),
            };

            updatePlace(updatedPlace);
            toggleModal();
            loadPlaces();
        };
    };

    addPlaceBtn.addEventListener("click", () => {
        addPlaceForm.reset();
        addPlaceForm.onsubmit = async (event) => {
            event.preventDefault();

            const images = await Promise.all(
                Array.from(document.getElementById("placeImages").files).map(readFileAsDataURL)
            );

            const place = {
                id: crypto.randomUUID(), // Generate unique ID
                name: document.getElementById("placeName").value,
                description: document.getElementById("placeDescription").value,
                alert: document.getElementById("placeAlert").value || "No alerts.",
                link: document.getElementById("placeLink").value,
                images,
                owner: currentUser, // Save the owner
            };

            savePlace(place);
            renderPlace(place);
            addPlaceForm.reset();
            toggleModal();
        };

        toggleModal();
    });

    cancelBtn.addEventListener("click", toggleModal);

    loadPlaces();
});
