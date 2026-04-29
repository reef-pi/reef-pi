package camera

import (
	"image"
	"image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"

	"github.com/nfnt/resize"
)

type ImageItem struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (c *Controller) Process(name string) error {
	d, err := filepath.Abs(c.config.ImageDirectory)
	if err != nil {
		return err
	}
	path := filepath.Join(d, name)
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()
	img, _, err := image.Decode(file)
	if err != nil {
		return err
	}
	m := resize.Resize(50, 0, img, resize.Lanczos3)
	dir, err := filepath.Abs(c.config.ImageDirectory)
	if err != nil {
		return err
	}
	thumbnailPath := filepath.Join(dir, "thumbnail-"+name)
	out, err := os.Create(thumbnailPath)
	if err != nil {
		return err
	}
	defer out.Close()
	jpeg.Encode(out, m, nil)
	i := ImageItem{
		Name: name,
	}
	return c.repo.CreateItem(i)
}

func (c *Controller) List() ([]ImageItem, error) {
	return c.repo.ListItems()
}
