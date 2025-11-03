//    Favorites Menu
//    GNOME Shell extension
//    @fthx 2025


import GObject from 'gi://GObject';
import St from 'gi://St';

import * as AppFavorites from 'resource:///org/gnome/shell/ui/appFavorites.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';


const FAVORITES_ICON_NAME = 'starred-symbolic'; // favorites symbolic icon name

var FavoritesMenuButton = GObject.registerClass(
    class FavoritesMenuButton extends PanelMenu.Button {
        _init() {
            super._init(0.0);

            this._makeButtonBox();

            AppFavorites.getAppFavorites()?.connectObject('changed', () => this._updateFavorites(), this);
        }

        _makeButtonBox() {
            this._box = new St.BoxLayout();

            this._icon = new St.Icon({ icon_name: FAVORITES_ICON_NAME, style_class: 'system-status-icon' });
            this._box.add_child(this._icon);

            this.add_child(this._box);

            this._updateFavorites();
        }

        _updateFavorites() {
            this.menu?.removeAll();

            const favorites = AppFavorites.getAppFavorites().getFavorites() ?? [];

            for (const favorite of favorites) {
                const item = new PopupMenu.PopupImageMenuItem(favorite?.get_name(), favorite?.icon);
                this.menu.addMenuItem(item);

                item.connectObject('activate', () => this._activateFavorite(favorite), this);
            }
        }

        _activateFavorite(favorite) {
            if (favorite?.can_open_new_window())
                favorite?.open_new_window(-1);
        }

        destroy() {
            this.menu?.removeAll();
            AppFavorites.getAppFavorites()?.disconnectObject(this);

            super.destroy();
        }
    });

export default class FavoritesMenuExtension {
    enable() {
        this._favoritesMenuButton = new FavoritesMenuButton();

        if (!Main.panel.statusArea['Favorites Menu Button'])
            Main.panel.addToStatusArea('Favorites Menu Button', this._favoritesMenuButton, 99, 'left');
    }

    disable() {
        this._favoritesMenuButton.destroy();
        this._favoritesMenuButton = null;
    }
}
