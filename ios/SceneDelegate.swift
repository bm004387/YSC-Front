import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {

        guard let windowScene = scene as? UIWindowScene else {
            return
        }

        guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else {
            return
        }

        let window = UIWindow(windowScene: windowScene)

        appDelegate.reactNativeFactory?.startReactNative(
            withModuleName: "MyApp",
            in: window,
            launchOptions: nil
        )

        self.window = window
        appDelegate.window = window
    }
}
