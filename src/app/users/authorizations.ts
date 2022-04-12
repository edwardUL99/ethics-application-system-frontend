/**
 * This file provides utilities for working with roles and permissions
 */

import { Role } from './role';
import { Permission } from './permission';
import { RoleResponse } from './responses/roleresponse';
import { PermissionResponse } from './responses/permissionresponse';

/**
 * This object respresents an object mapping of role tags to roles
 */
export type Roles = {
  [key: string]: Role;
};

/**
 * This type represents an object mapping permission tags to permissions
 */
export type Permissions = {
  [key: string]: Permission;
};

/**
 * Map the role response to a role
 * @param response the response to map
 */
export function mapRole(response: RoleResponse): Role {
  const mappedPermissions: Permission[] = response.permissions.map(permission => mapPermission(permission));

  return new Role(response.id, response.name, response.description, response.tag, mappedPermissions, response.singleUser, response.downgradeTo);
}

/**
 * Map a response of roles to a Roles object
 * @param response the response containing a listing of roles
 */
export function rolesFrom(response: RoleResponse[]): Roles {
  const roles: Roles = {};
  response.forEach(r => {
    const role = mapRole(r);
    roles[role.tag] = role
  });

  return roles;
}

/**
 * Map the permission response to a permission
 * @param response the response to map
 */
export function mapPermission(response: PermissionResponse): Permission {
  return new Permission(response.id, response.name, response.description, response.tag);
}

/**
 * Map the list of permission responses to the permissions
 * @param response the list of permission responses
 */
export function permissionsFrom(response: PermissionResponse[]): Permissions {
  const permissions: Permissions = {};
  response.forEach(p => {
    const permission = mapPermission(p);
    permissions[permission.tag] = permission;
  })

  return permissions;
}

/**
 * This class provides static functions for authorizing users based on roles or permissions
 */
export class Authorizer {
  /**
   * Prevent instantiation
   */
  private constructor() {}

  /**
   * Checks if the role isn't undefined
   * @param role the role to check
   */
  private static checkRole(role: Role) {
    const defined = role != undefined;

    if (!defined) {
      console.warn('Undefined Role, this should not happen');
    }

    return defined;
  }

  /**
   * Checks if the permission isn't undefined
   * @param role the permission to check
   */
  private static checkPermission(permission: Permission) {
    const defined = permission != undefined;

    if (!defined) {
      console.warn('Undefined Permission, this should not happen');
    }

    return defined;
  }

  /**
   * Check if the permission is in the set of permissions
   * @param permissions the permissions to search
   * @param permission the permission to check if it is in permissions
   */
  static hasPermission(permissions: Set<Permission>, permission: Permission): boolean {
    if (this.checkPermission(permission)) {
      const iterator = permissions.values();

      let next: IteratorResult<Permission, any>;
      
      while (!(next = iterator.next()).done) {
        if (permission.equals(next.value as Permission)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if the given role has all the required permissions
   * @param role the role to check
   * @param permissions the set of required permissions
   * @param requireAll true if the role requires all the permissions in the set or false if it only needs at least one
   */
  static requiredPermissions(role: Role, permissions: Set<Permission>, requireAll: boolean = false) {
    if (this.checkRole(role)) {
      let matched: boolean = true;
      
      for (let permission of permissions) {
        if (!this.checkPermission(permission)) {
          matched = false;
          continue;
        }

        const hasPermission = this.hasPermission(new Set(role.permissions), permission);
        
        matched = (requireAll) ? matched && hasPermission : matched || hasPermission;

        if (requireAll && !matched) {
          return false;
        } else if (!requireAll && matched) {
          return true;
        }
      }

      return matched;
    } else {
      return false;
    }
  }

  /**
   * Check the roles for equality (if any are undefined, they will leave a console warn as this should not happen)
   * @param role the role to check against role1
   * @param role1 the role to check against the first role
   */
  static roleEquals(role: Role, role1: Role) {
    const check = this.checkRole(role);
    const check1 = this.checkRole(role1);
    
    if (check && check1) {
      return role == role1;
    } else {
      return false;
    }
  }
}