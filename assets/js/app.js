const userLatitude = document.getElementById('userLatitude')
const userLongitude = document.getElementById('userLongitude')
const apiKey = '153ea72d76919f8bca55c6f22c3585725108363c207ffe3a69ad9785'
let cordonnes = { latitude: "", longitude: "" }
function isPromise(p) {
    if (typeof p === 'object' && typeof p.then === 'function') {
        return true;
    }
    return false;
}
const gps = () => {
    if (isPromise(geolocalisation)) {
        geolocalisation()
            .then(result => {
                userLatitude.value = result.latitude
                userLongitude.value = result.longitude
                carte(result.latitude, result.longitude, 18, 20)
            })
            .catch(err => console.log(err))
    } else {
        fromIp()
            .then(result => {
                userLatitude.value = result.latitude
                userLongitude.value = result.longitude
                carte(result.latitude, result.longitude, 16, 60, result.flag)
            })
            .catch(err => console.log(err))
    }
}
const carte = (latitude, longitude, zoom, radius, flag = "") => {
    /** leaflet map */
    // Variables globales
    // On initialise la map et on la centre sur notre adresse
    let map = L.map('map').setView([latitude, longitude], zoom); // coordonnés js.
    // ajouter une icon sur l'adresse
    const logo = L.icon({
        iconUrl: './assets/img/location-sign.svg',
        iconSize: [30, 30], // size of the icon
    });
    // On charge les "tuiles"
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 1,
        maxZoom: 20,
        name: 'tiles' // permettra de ne pas supprimer cette couche
    }).addTo(map);

    L.marker(
        [latitude, longitude], { icon: logo }
    ).addTo(map);
    let circle = L.circle([latitude, longitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius
    }).addTo(map);
    L.popup()
        .setLatLng([latitude, longitude])
        .setContent(`${flag} Lat: ${latitude} + Long : ${longitude}`)
        .openOn(map);
}

const geolocalisation = () => {
    let p = new Promise((res, rej) => {
        if (navigator.geolocalisation) {
            navigator.geolocalisation.getCurrentPosition((position) => {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;
                if (latitude && longitude) {
                    res(cordonnes = { latitude: latitude, longitude: longitude })
                }
                else rej('No data ..!')
            });
        }
    })
    return p
}

const fromIp = () => {
    let p = new Promise((res, rej) => {
        $.ajax({
            url: `https://api.ipdata.co?api-key=${apiKey}`
        }).done((data) => {
            let latitude = data.latitude;
            let longitude = data.longitude;
            let flag = data.emoji_flag;
            res(cordonnes = { latitude: latitude, longitude: longitude, flag: flag })
        }).fail(err => {
            rej(err);
        });
    });
    return p
}
gps()

const form = document.forms["searchGeolocation"];
const container = document.getElementById('results');
const searchGeoOnSubmit = () => {
    form.addEventListener("submit", (e) => {
        if (document.querySelector('ul.list-group')) document.querySelector('ul.list-group').remove()
        e.preventDefault();
        const search = document.getElementById('searchAddress').value
        if (search.length < 10) return
        const q = encodeURIComponent(search.split(' ').join('+'))
        fetch('https://api-adresse.data.gouv.fr/search/?q=' + q,
            { method: 'get' }
        ).then(response => response.json()
        ).then(results => {
            const ul = document.createElement('ul')
                ul.classList.add('list-group')
            for(let result of results.features){
                const li = document.createElement('li');
                li.classList.add('list-group-item')
                li.innerText = result.properties.label
                ul.appendChild(li);
                container.appendChild(ul)
            }
        })
        .catch(err => {
            console.log(err)
        })
    })
}
searchGeoOnSubmit()
// const comUrl = "https://geo.api.gouv.fr/communes?codePostal="
// const adressUrl = "https://api-adresse.data.gouv.fr/search/?q="//8+bd+du+port&postcode=44380
// const format = "&format=json"
// let nom = "";
// let cp = $('#cp')
// let ville = $('#ville')
// let adresse = $('#adresse')
// let adresses = $('#adresses')
// $(cp).on('blur', function () {
//     let code = $(this).val()
//     let url = comUrl + code + format
//     // console.log(url)
//     fetch(
//         url,
//         { method: 'get' }).then(response => response.json()).then(results => {
//             // console.log(results)
//             if (results.length) {
//                 $.each(results, function (k, v) {
//                     // console.log(v)
//                     // console.log(v.nom)
//                     $(ville).append('<option value="' + v.nom + '">' + v.nom + '</option>')
//                 })
//             }
//         }).catch(err => {
//             console.log(err)
//         })
// })

// /** Adresse */
// // $(cp).on('blur', function () {
// $(adresse).on('keypress', function () {
//     let code = $(cp).val()
//     let nom = $(this).val().split('')
//     let part = ""
//     for (let i = 0; i < nom.length; i++) {
//         part += nom[i]
//         if (part.length >= 1) {
//             let urlAdresse = adressUrl + part + "&postcode=" + code + format
//             console.log(urlAdresse)
//             fetch(
//                 urlAdresse,
//                 { method: 'get' }).then(response => response.json()).then(results => {
//                     console.log(results.features)
//                     if (results.features) {
//                         // $.each(results.features, function (k, v) {
//                         //     let ve = v['properties']
//                         //     $.each(ve, function (ke, va) {
//                         //         if (ke == 'name') {
//                         //             // console.log(va)
//                         //             $(adresses).append('<option class="resultat" value="' + va + '">' + va + '</option>')
//                         //             // $('.resultat').val("")
//                         //         }
//                         //     })
//                         // })
//                         let data = results.features
//                         data.forEach((adresse) => {
//                             document.querySelector('#adresses').innerHTML += `<option value="${adresse.properties.name}">`
//                         })
//                     }
//                 }).catch(err => {
//                     console.log(err)
//                 })
//         }

//     }
// })

