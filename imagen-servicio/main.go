package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

const (
	port        = "5000"
	photosDir    = "./photos"
	photoAPIURL = "https://maps.googleapis.com/maps/api/place/photo"
)

var apiKey = os.Getenv("GOOGLE_MAPS_API_KEY")

func main() {
	// Usar API key por defecto si no está configurada
	if apiKey == "" {
		apiKey = "AIzaSyBsup_X4cG3AstLomRcc34SaBT1xeUp2Qs"
	}

	// Crear directorio de fotos
	if err := os.MkdirAll(photosDir, 0755); err != nil {
		log.Fatalf("Error creando directorio: %v", err)
	}

	// Rutas
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/list", handleList)
	http.HandleFunc("/photo/", handlePhoto)
	http.HandleFunc("/download", handleDownload)

	log.Printf("🚀 Image Proxy Service iniciado en puerto %s", port)
	log.Printf("📁 Directorio de fotos: %s", photosDir)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{
	"service": "Image Proxy - google-limache",
	"port": %s,
	"endpoints": {
		"/": "Este endpoint",
		"/photo/<photo_ref>": "Obtiene foto por reference",
		"/download?ref=<photo_ref>": "Descarga foto de Google",
		"/list": "Lista fotos en cache"
	}
}`, port)
}

func handleList(w http.ResponseWriter, r *http.Request) {
	entries, err := os.ReadDir(photosDir)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	
	files := make([]string, 0)
	for _, e := range entries {
		if !e.IsDir() {
			files = append(files, e.Name())
		}
	}

	fmt.Fprintf(w, `{"count": %d, "files": %s}`, len(files), formatSlice(files))
}

func handlePhoto(w http.ResponseWriter, r *http.Request) {
	// Extraer photo_ref de /photo/<ref>
	photoRef := r.URL.Path[len("/photo/"):]
	if photoRef == "" {
		http.Error(w, "Falta photo_reference", 400)
		return
	}

	serveOrDownloadPhoto(w, photoRef)
}

func handleDownload(w http.ResponseWriter, r *http.Request) {
	photoRef := r.URL.Query().Get("ref")
	if photoRef == "" {
		http.Error(w, "Falta parámetro: ref", 400)
		return
	}

	filepath, err := downloadPhoto(photoRef)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	info, _ := os.Stat(filepath)
	fmt.Fprintf(w, `{"status": "ok", "filename": %q, "size": %d}`, filepath, info.Size())
}

func serveOrDownloadPhoto(w http.ResponseWriter, photoRef string) {
	filename := getFilename(photoRef)
	filepath := filepath.Join(photosDir, filename)

	// Si no existe, descargar
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		var err error
		filepath, err = downloadPhoto(photoRef)
		if err != nil {
			http.Error(w, err.Error(), 404)
			return
		}
	}

	// Servir archivo
	data, _ := os.ReadFile(filepath)
	w.Header().Set("Content-Type", "image/jpeg")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Write(data)
}

func downloadPhoto(photoRef string) (string, error) {
	filename := getFilename(photoRef)
	filepath := filepath.Join(photosDir, filename)

	// Ya existe?
	if _, err := os.Stat(filepath); err == nil {
		return filepath, nil
	}

	// Descargar de Google
	url := fmt.Sprintf("%s?maxwidth=400&photo_reference=%s&key=%s", photoAPIURL, photoRef, apiKey)
	resp, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("error descargando: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	// Guardar archivo
	out, err := os.Create(filepath)
	if err != nil {
		return "", err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return "", err
	}

	log.Printf("✓ Descargado: %s", filename)
	return filepath, nil
}

func getFilename(photoRef string) string {
	// Usar UUID basado en el photo_reference
	hash := uuid.NewSHA1(uuid.NameSpaceOID, []byte(photoRef))
	return hash.String()[:16] + ".jpg"
}

func formatSlice(s []string) string {
	if len(s) == 0 {
		return "[]"
	}
	result := "["
	for i, f := range s {
		if i > 0 {
			result += ", "
		}
		result += fmt.Sprintf("%q", f)
	}
	return result + "]"
}