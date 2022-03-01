import { Type } from "@angular/core";
import { ComponentType } from "../../models/components/applicationcomponent"
import { ApplicationViewComponent } from "./application-view.component";

/**
 * The type of the registered components mapping
 */
export type RegisteredComponentsMapping = {
    [key in ComponentType]?: Type<ApplicationViewComponent>
}

/**
 * This class holds the component views registered for rendering the application template components
 */
class RegisteredComponentViews {
    /**
     * The mapping of components
     */
    private components: RegisteredComponentsMapping = {};

    /**
     * Register the view component and associate it with the given component type
     * @param componentType the type of the component
     * @param component the view component
     */
    registerComponent(componentType: ComponentType, component: Type<ApplicationViewComponent>) {
        this.components[componentType] = component;
    }

    /**
     * Retrieve the registered component for the given component type
     * @param componentType the type of the component
     */
    getComponent(componentType: ComponentType): Type<ApplicationViewComponent> {
        if (!(componentType in this.components)) {
            throw new Error(`No ApplicationViewComponent registered for component type ${componentType}`);
        }

        return this.components[componentType];
    }
}

export const registeredComponents = new RegisteredComponentViews();

/**
 * This decorator registers the component view with the RegisteredComponentViews
 * @param type the component type to register the component for
 * @returns the decorator instance
 */
export function ComponentViewRegistration(type: ComponentType) {
    return <T extends ApplicationViewComponent>(target: new (...arg: any) => T): new (...arg: any) => T => {
        registeredComponents.registerComponent(type, target);

        return target;
    }
}