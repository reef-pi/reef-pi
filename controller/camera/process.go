package camera

import (
	"encoding/json"
	"github.com/nfnt/resize"
	"image/png"
	"os"
	"path/filepath"
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
	img, err := png.Decode(file)
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
	png.Encode(out, m)
	i := ImageItem{
		Name: name,
	}
	fn := func(id string) interface{} {
		i.ID = id
		return &i
	}
	return c.store.Create(ItemBucket, fn)
}

func (c *Controller) List() ([]ImageItem, error) {
	items := []ImageItem{}
	fn := func(v []byte) error {
		var i ImageItem
		if err := json.Unmarshal(v, &i); err != nil {
			return err
		}
		items = append(items, i)
		return nil
	}
	return items, c.store.List(ItemBucket, fn)
}
