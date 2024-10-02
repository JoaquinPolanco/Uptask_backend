import { Router } from 'express'
import { body, param } from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { projectExists } from '../middleware/project'
import { hasAuthorization, taskBelongsToProject, taskExists } from '../middleware/task'
import { authenticate } from '../middleware/auth'
import { TeamMemberController } from '../controllers/TeamController'
import { NoteController } from '../controllers/NoteControllers'

const router = Router()

router.use(authenticate)

router.post('/',
    body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName').notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description').notEmpty().withMessage('La Descripcion del Proyecto es Obligatorio'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)

router.get('/:id',
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.getProjectsByID
)


/*  ROutes for Task*/

router.param('projectid', projectExists)

router.put('/:projectid',
    param('projectid').isMongoId().withMessage('ID no valido'),
    body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName').notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description').notEmpty().withMessage('La Descripcion del Proyecto es Obligatorio'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
)
router.delete('/:projectid',
    param('projectid').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject
)



router.post('/:projectid/tasks',
    hasAuthorization,
    body('name').notEmpty().withMessage('El Nombre de la tarea es Obligatorio'),
    body('description').notEmpty().withMessage('La Descripcion de la tarea es Obligatorio'),
    handleInputErrors,
    TaskController.createTask

)
router.get('/:projectid/tasks',
    TaskController.getProjectTask
)

router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectid/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.getTaskById
)
router.put('/:projectid/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('name').notEmpty().withMessage('El Nombre de la tarea es Obligatorio'),
    body('description').notEmpty().withMessage('La Descripcion de la tarea es Obligatorio'),
    handleInputErrors,
    TaskController.updateTask
)
router.delete('/:projectid/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.deleteTask
)
router.post('/:projectid/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('status')
        .notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)
/** routes por team */


router.post('/:projectid/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no valido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)


router.get('/:projectid/team',
    TeamMemberController.getProjecteam
)


router.post('/:projectid/team',
    body('id')
        .isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)
router.delete('/:projectid/team/:userid',
    param('userid')
        .isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

/** rotues por notes */

router.post('/:projectid/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es Obligatorio'),
    handleInputErrors,
    NoteController.createNote

)

router.get('/:projectid/tasks/:taskId/notes',
    NoteController.getTaskNote

)
router.delete('/:projectid/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    NoteController.deleteNote

)




export default router 