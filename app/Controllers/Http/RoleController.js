'use strict'

const Role = use('Role')

class RoleController {
  // vai mostrar todas as roles cadastradas
  async index () {
    const roles = await Role.query().with('permissions').fetch()

    return roles
  }
  // vai mostrar os dados de acordo com o id que vai passar
  async show ({ params }) {
    const role = await Role.findOrFail(params.id)

    await role.load('permissions')

    return role
  }

  // vai criar uma nova role
  async store ({ request }) {
    // a role pode ter permissions atreladas a ela
    // ex: moderador pode ler escrever posts

    const { permissions, ...data } = request.only([
      'name',
      'slug',
      'description',
      'permissions'
    ])

    const role = await Role.create(data)
    // essa verificação pega o id da permission
    if (permissions) {
      // attach serve para fazer o link entre permissions e roles
      await role.permissions().attach(permissions)
    }

    await role.load('permissions')

    return role
  }

  // atualizar role
  async update ({ request, params }) {
    const { permissions, ...data } = request.only([
      'name',
      'slug',
      'description',
      'permissions'
    ])

    const role = await Role.findOrFail(params.id)
    // para atualizar os dados
    role.merge(data)

    await role.save()

    if (permissions) {
      // sync vai limpar os dados antigos e colocar novos dados
      await role.permissions().sync(permissions)
    }

    await role.load('permissions')

    return role
  }

  // deletar role

  async destroy ({ params }) {
    const role = await Role.findOrFail(params.id)

    await role.delete()
  }
}

module.exports = RoleController
