export class AuthService {
    static auth = null;

    static init(auth) {
        this.auth = auth;
    }

    static async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    }

    static async signOut() {
        try {
            await this.auth.signOut();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    }

    static getCurrentUser() {
        return this.auth.currentUser;
    }

    static onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(callback);
    }
} 