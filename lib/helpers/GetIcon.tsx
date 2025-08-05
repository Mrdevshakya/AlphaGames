import { IMAGES, getDiceImage, getPileImage } from '../../assets/images';
import { COLORS } from '$constants/colors';

interface Image {
    name: string | number;
    image: any;
}

export class BackgroundImage {
    private static images: Array<Image> = [
        // Color-based pile images
        {
            name: COLORS.green,
            image: IMAGES.GreenPile
        },
        {
            name: COLORS.red,
            image: IMAGES.RedPile
        },
        {
            name: COLORS.yellow,
            image: IMAGES.YellowPile
        },
        {
            name: COLORS.blue,
            image: IMAGES.BluePile
        },
        // String-based color names
        {
            name: 'green',
            image: IMAGES.GreenPile
        },
        {
            name: 'red',
            image: IMAGES.RedPile
        },
        {
            name: 'yellow',
            image: IMAGES.YellowPile
        },
        {
            name: 'blue',
            image: IMAGES.BluePile
        },
        // Dice images
        {
            name: 1,
            image: IMAGES.Dice1
        },
        {
            name: 2,
            image: IMAGES.Dice2
        },
        {
            name: 3,
            image: IMAGES.Dice3
        },
        {
            name: 4,
            image: IMAGES.Dice4
        },
        {
            name: 5,
            image: IMAGES.Dice5
        },
        {
            name: 6,
            image: IMAGES.Dice6
        },
        // UI Elements
        {
            name: 'Menu',
            image: IMAGES.Menu
        },
        {
            name: 'Arrow',
            image: IMAGES.Arrow
        },
        {
            name: 'Start',
            image: IMAGES.Start
        },
        {
            name: 'LudoBoard',
            image: IMAGES.LudoBoard
        }
    ];

    static getImage = (name: string | number) => {
        // First try to find exact match
        const found = BackgroundImage.images.find(image => image.name === name);
        if (found) {
            return found.image;
        }

        // Handle dice numbers with fallback
        if (typeof name === 'number' && name >= 1 && name <= 6) {
            return getDiceImage(name);
        }

        // Handle color strings with fallback
        if (typeof name === 'string') {
            const lowerName = name.toLowerCase();
            if (['red', 'green', 'yellow', 'blue'].includes(lowerName)) {
                return getPileImage(lowerName);
            }
        }

        // Default fallback to red pile
        console.warn(`Image not found for: ${name}, using default red pile`);
        return IMAGES.RedPile;
    }

    // Helper methods for specific image types
    static getDiceImage = getDiceImage;
    static getPileImage = getPileImage;
    
    static getUIImage = (name: string) => {
        const uiImages: { [key: string]: any } = {
            'menu': IMAGES.Menu,
            'arrow': IMAGES.Arrow,
            'start': IMAGES.Start,
            'board': IMAGES.LudoBoard,
            'ludoboard': IMAGES.LudoBoard
        };
        
        return uiImages[name.toLowerCase()] || IMAGES.Menu;
    }
}

// Export for backward compatibility
export const getIcon = BackgroundImage.getImage;
export default BackgroundImage;