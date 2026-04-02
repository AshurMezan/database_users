<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(true)
const error = ref(null)
const saveStatus = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/api/users')
    if (!res.ok) {
      throw new Error(`Сервер ответил ${res.status}`)
    }
    users.value = await res.json()
  } catch (err) {
    // Если даже 404 или другая ошибка — просто считаем, что база пустая
    console.warn('Не удалось загрузить пользователей:', err)
    users.value = []
  } finally {
    loading.value = false
  }
})

const newUser = ref({
  fullName: '',
  pcLogin: '',
  pcPassword: '',
  outlookLogin: '',
  outlookPassword: '',
  directumLogin: '',
  directumPassword: '',
  vipnetVersion: '',
  vipnetPassword: ''
})


const editingId = ref(null)
const editForm = ref({})

const startEdit = (user) => {
  editingId.value = user.id
  editForm.value = { ...user }
}

const cancelEdit = () => {
  editingId.value = null
  editForm.value = {}
}

const saveEdit = (index) => {
  if (editingId.value) {
    users.value[index] = { ...editForm.value, id: users.value[index].id }
    cancelEdit()
  }
}

const addUser = () => {
  if (!newUser.value.fullName?.trim()) {
    alert('Укажите хотя бы Ф.И.О.')
    return
  }

  const newId = users.value.length > 0
      ? Math.max(...users.value.map(u => u.id || 0)) + 1
      : 1

  users.value.push({
    id: newId,
    ...newUser.value
  })

  newUser.value = {
    fullName: '',
    pcLogin: '',
    pcPassword: '',
    outlookLogin: '',
    outlookPassword: '',
    directumLogin: '',
    directumPassword: '',
    vipnetVersion: '',
    vipnetPassword: ''
  }
}


const saveAll = async () => {
  if (users.value.length === 0) {
    alert('Нет данных для сохранения')
    return
  }

  saveStatus.value = 'Сохранение...'
  try {
    const res = await fetch('/api/users/save-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users.value)
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText || `HTTP ${res.status}`)
    }

    saveStatus.value = `Сохранено ${users.value.length} записей ✓`
    setTimeout(() => saveStatus.value = '', 4000)
  } catch (err) {
    saveStatus.value = 'Ошибка сохранения: ' + err.message
    console.error(err)
  }
}
</script>

<template>
  <div class="container-fluid my-5">
    <h1 class="text-center mb-4">База пользователей</h1>

    <div v-if="loading" class="alert alert-info text-center">
      Проверка базы данных...
    </div>

    <div v-else>
      <!-- Форма добавления – всегда видна -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Карточка нового пользователя</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Ф.И.О. *</label>
              <input v-model="newUser.fullName" class="form-control" placeholder="Иванов Иван Иванович" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Логин ПК</label>
              <input v-model="newUser.pcLogin" class="form-control" placeholder="ivanov_i" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Пароль от ПК</label>
              <input
                  v-model="newUser.pcPassword"
                  type="text"
                  class="form-control"
              />
            </div>

            <div class="col-md-3">
              <label class="form-label">Версия ViPNet</label>
              <input v-model="newUser.vipnetVersion" class="form-control" placeholder="4.5.2" />
            </div>

            <div class="col-md-3">
              <label class="form-label">Пароль от ViPNet</label>
              <input
                  v-model="newUser.vipnetPassword"
                  type="text"
                  class="form-control"
              />
            </div>

            <div class="col-md-6">
              <label class="form-label">Логин Outlook</label>
              <input v-model="newUser.outlookLogin" class="form-control" placeholder="ivanov.i@company.ru" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Пароль Outlook</label>
              <input v-model="newUser.outlookPassword" class="form-control" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Логин Directum</label>
              <input v-model="newUser.directumLogin" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Пароль Directum</label>
              <input v-model="newUser.directumPassword" class="form-control" />
            </div>

            <div class="col-12 text-end">
              <button class="btn btn-success" @click="addUser">
                <i class="bi bi-plus-circle me-2"></i> Добавить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка сохранения -->
      <div class="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <button
            class="btn btn-lg btn-primary"
            @click="saveAll"
            :disabled="users.length === 0"
        >
          <i class="bi bi-floppy me-2"></i> Сохранить все изменения в БД
        </button>

        <span v-if="saveStatus" class="fw-bold" :class="saveStatus.includes('Ошибка') ? 'text-danger' : 'text-success'">
          {{ saveStatus }}
        </span>
      </div>

      <!-- Состояние таблицы -->
      <div v-if="users.length === 0" class="alert alert-secondary text-center py-5">
        <h4 class="mb-3">База данных пустая</h4>
        <p class="mb-4">
          Добавьте первого пользователя с помощью формы выше,<br>
          а затем нажмите кнопку «Сохранить все изменения в БД»
        </p>
        <i class="bi bi-database-slash fs-1 text-muted"></i>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-striped table-hover table-bordered align-middle">
          <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Ф.И.О.</th>
            <th>Логин ПК</th>
            <th>Пароль ПК</th>
            <th>Логин Outlook</th>
            <th>Пароль Outlook</th>
            <th>Логин Directum</th>
            <th>Пароль Directum</th>
            <th>Версия ViPNet</th>
            <th>Пароль ViPNet</th>
            <th style="width:140px">Действия</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(user, index) in users" :key="user.id">
            <template v-if="editingId === user.id">
              <td>{{ user.id }}</td>
              <td><input v-model="editForm.fullName" class="form-control form-control-sm" /></td>
              <td><input v-model="editForm.pcLogin" class="form-control form-control-sm" /></td>
              <td><input v-model="editForm.pcPassword" class="form-control form-control-sm" /></td>
              <td><input v-model="editForm.outlookLogin" class="form-control form-control-sm" /></td>
              <td><input v-model="editForm.outlookPassword" class="form-control form-control-sm" /></td>
              <td><input v-model="editForm.directumLogin" class="form-control form-control-sm" /></td>
              <td><input v-model="editForm.directumPassword" class="form-control form-control-sm" /></td>
              <td><input v-model="editForm.vipnetVersion" class="form-control form-control-sm" /></td>
              <td><input v-model="editForm.vipnetPassword" class="form-control form-control-sm" /></td>
              <td>
                <button class="btn btn-sm btn-success me-1" @click="saveEdit(index)">✓</button>
                <button class="btn btn-sm btn-secondary" @click="cancelEdit">✕</button>
              </td>
            </template>

            <template v-else>
              <td>{{ user.id }}</td>
              <td>{{ user.fullName }}</td>
              <td>{{ user.pcLogin }}</td>
              <td>{{ user.pcPassword }}</td>
              <td>{{ user.outlookLogin }}</td>
              <td>{{ user.outlookPassword }}</td>
              <td>{{ user.directumLogin }}</td>
              <td>{{ user.directumPassword }}</td>
              <td>{{ user.vipnetVersion }}</td>
              <td>{{ user.vipnetPassword }}</td>
              <td>
                <button class="btn btn-sm btn-primary" @click="startEdit(user)">
                  <i class="bi bi-pencil"></i> Изм.
                </button>
              </td>
            </template>
          </tr>
          </tbody>
        </table>
      </div>

      <p class="text-muted small mt-4 text-center">
        Данные хранятся в файле <code>users.db</code> в корне проекта.
      </p>
    </div>
  </div>
</template>

<style scoped>
.alert-secondary {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

</style>