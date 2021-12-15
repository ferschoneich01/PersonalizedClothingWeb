    const imagePreview = document.getElementById('img-preview');
    const imageUploader = document.getElementById('img-uploader');
    const imageUploadbar = document.getElementById('img-upload-bar');

    //Direccion de la api para el guardado y key de permiso de cuenta.
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzlbg8ni6/image/upload';
    const CLOUDINARY_UPLOAD_PRESET = 'ss1j77hf';


    imageUploader.addEventListener('change', async (e) => {

        //console.log(e);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Send to cloudianry
        const res = await axios.post(
            CLOUDINARY_URL,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress (e) {
                    let progress = Math.round((e.loaded * 100.0) / e.total);
                    console.log(progress);
                    imageUploadbar.setAttribute('value', progress);
                }
            }
        );
        console.log(res);
        imagePreview.src = res.data.secure_url;
        console.log(res.data.secure_url);
        document.getElementById("photo").value = res.data.secure_url;
    });