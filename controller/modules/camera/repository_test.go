package camera

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func testRepository(t *testing.T) repository {
	t.Helper()
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		store.Close()
	})

	repo := newRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}
	return repo
}

func TestStoreRepositoryConfigPersistence(t *testing.T) {
	repo := testRepository(t)

	conf := Default
	conf.Enable = true
	conf.ImageDirectory = "/tmp/camera-images"
	conf.CaptureFlags = "--width 800"
	conf.Upload = true
	conf.Motion.Enable = true
	if err := repo.SaveConfig(conf); err != nil {
		t.Fatal(err)
	}

	got, err := repo.LoadConfig()
	if err != nil {
		t.Fatal(err)
	}
	if got.ImageDirectory != conf.ImageDirectory || got.CaptureFlags != conf.CaptureFlags || !got.Enable || !got.Upload || !got.Motion.Enable {
		t.Fatalf("unexpected config: %#v", got)
	}

	conf.TickInterval = 0
	if err := repo.SaveConfig(conf); err == nil {
		t.Fatal("expected invalid tick interval to fail")
	}
	conf = Default
	conf.ImageDirectory = ""
	if err := repo.SaveConfig(conf); err == nil {
		t.Fatal("expected empty image directory to fail")
	}
}

func TestStoreRepositoryLatestAndItems(t *testing.T) {
	repo := testRepository(t)

	if err := repo.SaveLatest("latest.jpg"); err != nil {
		t.Fatal(err)
	}
	latest, err := repo.Latest()
	if err != nil {
		t.Fatal(err)
	}
	if latest["image"] != "latest.jpg" {
		t.Fatalf("unexpected latest image: %#v", latest)
	}

	if err := repo.CreateItem(ImageItem{Name: "first.jpg"}); err != nil {
		t.Fatal(err)
	}
	if err := repo.CreateItem(ImageItem{Name: "second.jpg"}); err != nil {
		t.Fatal(err)
	}
	items, err := repo.ListItems()
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 items, got %#v", items)
	}

	names := map[string]string{}
	for _, item := range items {
		names[item.ID] = item.Name
	}
	if names["1"] != "first.jpg" || names["2"] != "second.jpg" {
		t.Fatalf("unexpected items: %#v", items)
	}
}
